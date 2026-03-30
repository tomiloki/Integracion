import logging
from decimal import Decimal

from django.db import connection, transaction
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CartItem, Category, Order, OrderItem, Payment, Product, User
from .permissions import IsAdminRole
from .serializers import (
    CartItemSerializer,
    CategorySerializer,
    CustomTokenObtainPairSerializer,
    OrderAdminSerializer,
    OrderSerializer,
    ProductAdminSerializer,
    ProductSerializer,
    UserAdminSerializer,
    UserRegisterSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


def build_products_queryset(request):
    queryset = Product.objects.select_related("category").all().order_by("-created_at")

    term = (request.query_params.get("q") or request.query_params.get("search") or "").strip()
    if term:
        queryset = queryset.filter(
            Q(name__icontains=term)
            | Q(brand__icontains=term)
            | Q(category__name__icontains=term)
            | Q(sku__icontains=term)
        )

    category_id = request.query_params.get("category")
    if category_id:
        queryset = queryset.filter(category_id=category_id)

    channel = request.query_params.get("channel", "b2c").lower()
    if channel == "b2b":
        user = request.user
        if not user.is_authenticated or user.role not in {"distributor", "admin"}:
            raise PermissionDenied("El canal B2B requiere autenticacion con rol distribuidor o admin.")

    return queryset


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return build_products_queryset(self.request)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["channel"] = self.request.query_params.get("channel", "b2c").lower()
        return context


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


class PaymentView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        return Response(
            {
                "detail": "Endpoint deprecado. Usa /api/webpay/init/ y /api/webpay/commit/."
            },
            status=status.HTTP_410_GONE,
        )


class CatalogView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return build_products_queryset(self.request)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["channel"] = self.request.query_params.get("channel", "b2c").lower()
        return context


class CartItemListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related("product")

    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)

        if quantity > product.quantity:
            raise ValidationError(f"Solo quedan {product.quantity} unidades en stock.")

        existing = CartItem.objects.filter(user=user, product=product).first()
        if existing:
            new_qty = existing.quantity + quantity
            if new_qty > product.quantity:
                raise ValidationError(f"Solo quedan {product.quantity} unidades en stock.")
            existing.quantity = new_qty
            existing.save(update_fields=["quantity"])
            serializer.instance = existing
            return

        serializer.instance = CartItem.objects.create(
            user=user,
            product=product,
            quantity=quantity,
        )


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related("product")

    def perform_update(self, serializer):
        product = serializer.instance.product
        quantity = serializer.validated_data.get("quantity", serializer.instance.quantity)
        if quantity > product.quantity:
            raise ValidationError(f"Solo quedan {product.quantity} unidades en stock.")
        serializer.save()


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        cart_items = list(
            CartItem.objects.select_related("product")
            .filter(user=user)
            .order_by("id")
        )

        if not cart_items:
            return Response({"error": "El carrito esta vacio."}, status=status.HTTP_400_BAD_REQUEST)

        product_ids = [item.product_id for item in cart_items]
        locked_products = {
            product.id: product
            for product in Product.objects.select_for_update().filter(id__in=product_ids)
        }

        order = Order.objects.create(user=user, status=Order.STATUS_PENDING)
        for item in cart_items:
            product = locked_products[item.product_id]
            if item.quantity > product.quantity:
                raise ValidationError(f"Stock insuficiente para {product.name}. Quedan {product.quantity}.")

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.quantity,
                price=product.price,
            )
            product.quantity -= item.quantity
            product.save(update_fields=["quantity"])

        CartItem.objects.filter(user=user).delete()
        serializer = OrderSerializer(order, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items__product")


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)


class UserOrdersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = (
            Order.objects.filter(user=request.user)
            .order_by("-created_at")
            .prefetch_related("items__product")
        )
        serializer = OrderSerializer(orders, many=True, context={"request": request})
        return Response(serializer.data)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").all().order_by("-created_at")
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("user").prefetch_related("items__product").all().order_by("-created_at")
    serializer_class = OrderAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    http_method_names = ["get", "patch", "head", "options"]

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get("status")
        valid_statuses = {choice[0] for choice in Order.STATUS_CHOICES}
        if new_status not in valid_statuses:
            return Response(
                {"detail": "Estado de pedido invalido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = new_status
        order.save(update_fields=["status"])
        serializer = self.get_serializer(order)
        return Response(serializer.data)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    http_method_names = ["get", "patch", "head", "options"]

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        if "role" in request.data:
            role = request.data["role"]
            if role not in {"customer", "distributor", "admin"}:
                return Response({"detail": "Rol invalido."}, status=status.HTTP_400_BAD_REQUEST)
            user.role = role
            user.is_staff = role == "admin"

        if "is_active" in request.data:
            user.is_active = bool(request.data["is_active"])

        user.save(update_fields=["role", "is_staff", "is_active"])
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class AdminMetricsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        paid_total = Payment.objects.filter(status=Payment.STATUS_PAID).aggregate(total=Sum("amount"))["total"]
        metrics = {
            "orders_total": Order.objects.count(),
            "orders_pending": Order.objects.filter(status=Order.STATUS_PENDING).count(),
            "orders_completed": Order.objects.filter(status=Order.STATUS_COMPLETED).count(),
            "users_total": User.objects.count(),
            "products_total": Product.objects.count(),
            "stock_critical": Product.objects.filter(quantity__lte=5).count(),
            "revenue_paid": float(paid_total or Decimal("0")),
        }
        return Response(metrics)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db_ok = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception:
            logger.exception("Health check database validation failed")
            db_ok = False

        payload = {
            "service": "autoparts-backend",
            "status": "ok" if db_ok else "degraded",
            "database": "ok" if db_ok else "error",
            "timestamp": timezone.now().isoformat(),
        }
        status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(payload, status=status_code)
