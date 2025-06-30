# api/webpay_views.py

import requests
from django.shortcuts       import get_object_or_404
from django.utils           import timezone
from django.conf            import settings
from rest_framework.views   import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from decimal import Decimal

from .models      import Order, Payment
from .serializers import OrderSerializer

from requests.exceptions import HTTPError

class WebpayInitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1) Obtener el pedido
        order = get_object_or_404(Order, id=request.data.get('order_id'), user=request.user)
        if order.status != 'pendiente':
            return Response({'error': 'El pedido ya no está pendiente.'}, status=400)

        # 2) Calcular monto entero
        subtotal = sum(item.quantity * item.price for item in order.items.all())    
        IVA_RATE = Decimal('0.19')  # Convertir a Decimal
        amount = int((subtotal * (1 + IVA_RATE)).quantize(Decimal('1'), rounding='ROUND_HALF_UP'))

        # 3) Payload
        session_id = f"{request.user.id}-{order.id}-{int(timezone.now().timestamp())}"
        buy_order  = str(order.id)
        return_url = f"{settings.FRONTEND_URL}/checkout/success"

        payload = {
            "buy_order":  buy_order,
            "session_id": session_id,
            "amount":     amount,
            "return_url": return_url
        }

        # 4) Llamada REST pura
        url = f"{settings.WEBPAY_HOST}/rswebpaytransaction/api/webpay/v1.2/transactions"
        headers = {
            'Tbk-Api-Key-Id':     settings.WEBPAY_COMMERCE_CODE,
            'Tbk-Api-Key-Secret': settings.WEBPAY_API_KEY,
            'Content-Type':       'application/json'
        }
        resp = requests.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

        # 5) Guardar token_ws
        Payment.objects.update_or_create(
            order=order,
            defaults={
                "amount":   amount,
                "method":   "webpay",
                "status":   "iniciada",
                "token_ws": data["token"]
            }
        )

        # 6) Devolver URL + token al frontend
        return Response({"url": data["url"], "token": data["token"]})


class WebpayCommitView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token_ws')
        if not token:
            return Response({'error': 'token_ws no proporcionado.'}, status=400)

        # 1) Confirmar transacción
        url = f"{settings.WEBPAY_HOST}/rswebpaytransaction/api/webpay/v1.2/transactions/{token}"
        headers = {
            'Tbk-Api-Key-Id':     settings.WEBPAY_COMMERCE_CODE,
            'Tbk-Api-Key-Secret': settings.WEBPAY_API_KEY,
            'Content-Type':       'application/json'
        }
        try:
            resp = requests.put(url, headers=headers)
            resp.raise_for_status()
            commit = resp.json()
        except HTTPError as e:
            # intenta parsear JSON de error, sino vacía
            err = {}
            try: err = resp.json()
            except: pass
            return Response(
                {'error': 'Error al confirmar en Webpay', 'detail': err},
                status=400
            )

        # 2) Actualizar Payment + Order
        payment = get_object_or_404(Payment, token_ws=token)
        payment.status  = 'pagado' if commit.get('status') == 'AUTHORIZED' else commit.get('status').lower()
        payment.paid_at = timezone.now()
        payment.save()

        order = payment.order
        order.status = 'completado' if payment.status == 'pagado' else 'rechazado'
        order.save()

        # 3) Devolver pedido + datos de commit
        try:
            serializer = OrderSerializer(order, context={'request': request})
            payload = {
                'order': serializer.data,
                'commit': commit
            }
            return Response(payload)
        except Exception as e:
            # imprime el error y, opcionalmente, el data parcial
            print("ERROR al serializar OrderSerializer:", e)
            raise