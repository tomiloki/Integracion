import logging
from decimal import Decimal
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone
from requests.exceptions import RequestException
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, Payment
from .serializers import OrderSerializer
from .services import compute_order_subtotal, compute_total_with_tax

logger = logging.getLogger(__name__)


class WebpayInitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order = get_object_or_404(Order, id=request.data.get("order_id"), user=request.user)

        if order.status in {Order.STATUS_COMPLETED, Order.STATUS_CANCELLED}:
            return Response({"error": "El pedido no admite nuevos pagos."}, status=status.HTTP_400_BAD_REQUEST)

        items = list(order.items.all())
        if not items:
            return Response({"error": "El pedido no tiene productos."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = compute_order_subtotal(items)
        amount = int(compute_total_with_tax(subtotal))

        payment = Payment.objects.filter(order=order).first()
        if payment and payment.status == Payment.STATUS_PAID:
            serializer = OrderSerializer(order, context={"request": request})
            return Response(
                {
                    "detail": "El pedido ya fue pagado.",
                    "order": serializer.data,
                    "already_paid": True,
                },
                status=status.HTTP_200_OK,
            )

        session_id = f"{request.user.id}-{order.id}-{int(timezone.now().timestamp())}"
        buy_order = str(order.id)
        return_url = request.build_absolute_uri(reverse("webpay-return"))

        payload = {
            "buy_order": buy_order,
            "session_id": session_id,
            "amount": amount,
            "return_url": return_url,
        }

        url = f"{settings.WEBPAY_HOST}/rswebpaytransaction/api/webpay/v1.2/transactions"
        headers = {
            "Tbk-Api-Key-Id": settings.WEBPAY_COMMERCE_CODE,
            "Tbk-Api-Key-Secret": settings.WEBPAY_API_KEY,
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=settings.WEBPAY_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            data = response.json()
        except RequestException:
            logger.exception("Error al iniciar transaccion Webpay para order_id=%s", order.id)
            return Response(
                {"error": "No fue posible iniciar la transaccion en Webpay."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        Payment.objects.update_or_create(
            order=order,
            defaults={
                "amount": amount,
                "method": "webpay",
                "status": Payment.STATUS_INITIATED,
                "token_ws": data["token"],
            },
        )

        order.status = Order.STATUS_PAYMENT_IN_PROGRESS
        order.save(update_fields=["status"])

        return Response({"url": data["url"], "token": data["token"]}, status=status.HTTP_200_OK)


class WebpayReturnView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def _frontend_success_url(self, **params):
        base_url = f"{settings.FRONTEND_URL.rstrip('/')}/checkout/success"
        clean_params = {key: value for key, value in params.items() if value is not None}
        if not clean_params:
            return base_url
        return f"{base_url}?{urlencode(clean_params)}"

    def post(self, request):
        token = request.data.get("token_ws") or request.POST.get("token_ws")
        if token:
            return HttpResponseRedirect(self._frontend_success_url(token_ws=token))

        return HttpResponseRedirect(
            self._frontend_success_url(
                cancelled="1",
                tbk_token=request.data.get("TBK_TOKEN") or request.POST.get("TBK_TOKEN"),
            )
        )

    def get(self, request):
        token = request.query_params.get("token_ws")
        if token:
            return HttpResponseRedirect(self._frontend_success_url(token_ws=token))

        return HttpResponseRedirect(
            self._frontend_success_url(
                cancelled=request.query_params.get("cancelled", "1"),
                tbk_token=request.query_params.get("TBK_TOKEN"),
            )
        )


class WebpayCommitView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token_ws")
        if not token:
            return Response({"error": "token_ws no proporcionado."}, status=status.HTTP_400_BAD_REQUEST)

        payment = get_object_or_404(Payment, token_ws=token)
        order = payment.order

        if payment.status == Payment.STATUS_PAID and order.status == Order.STATUS_COMPLETED:
            serializer = OrderSerializer(order, context={"request": request})
            return Response(
                {
                    "order": serializer.data,
                    "commit": {"status": "AUTHORIZED", "token": token},
                    "already_committed": True,
                },
                status=status.HTTP_200_OK,
            )

        url = f"{settings.WEBPAY_HOST}/rswebpaytransaction/api/webpay/v1.2/transactions/{token}"
        headers = {
            "Tbk-Api-Key-Id": settings.WEBPAY_COMMERCE_CODE,
            "Tbk-Api-Key-Secret": settings.WEBPAY_API_KEY,
            "Content-Type": "application/json",
        }

        try:
            response = requests.put(
                url,
                headers=headers,
                timeout=settings.WEBPAY_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            commit = response.json()
        except RequestException:
            logger.exception("Error al confirmar transaccion Webpay token=%s", token)
            return Response(
                {"error": "Error al confirmar transaccion en Webpay."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        expected_buy_order = str(order.id)
        expected_amount = int(compute_total_with_tax(compute_order_subtotal(order.items.all())))

        commit_buy_order = str(commit.get("buy_order", ""))
        commit_amount = int(commit.get("amount", 0))

        if commit_buy_order != expected_buy_order or commit_amount != expected_amount:
            payment.status = Payment.STATUS_REJECTED
            payment.save(update_fields=["status"])
            order.status = Order.STATUS_REJECTED
            order.save(update_fields=["status"])
            return Response(
                {
                    "error": "La respuesta de Webpay no coincide con el pedido.",
                    "detail": {
                        "expected_buy_order": expected_buy_order,
                        "expected_amount": expected_amount,
                        "commit_buy_order": commit_buy_order,
                        "commit_amount": commit_amount,
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment.status = (
            Payment.STATUS_PAID
            if commit.get("status") == "AUTHORIZED"
            else Payment.STATUS_REJECTED
        )
        payment.paid_at = timezone.now() if payment.status == Payment.STATUS_PAID else None
        payment.save(update_fields=["status", "paid_at"])

        order.status = (
            Order.STATUS_COMPLETED
            if payment.status == Payment.STATUS_PAID
            else Order.STATUS_REJECTED
        )
        order.save(update_fields=["status"])

        serializer = OrderSerializer(order, context={"request": request})
        return Response(
            {
                "order": serializer.data,
                "commit": commit,
                "already_committed": False,
            },
            status=status.HTTP_200_OK,
        )
