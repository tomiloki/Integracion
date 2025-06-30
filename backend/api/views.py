# backend/api/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.timezone import now
from django.db import transaction
from decimal import Decimal, InvalidOperation

from .models import Product, User, Order, Payment, CartItem, OrderItem, Category
from .serializers import ProductSerializer, UserRegisterSerializer, CartItemSerializer, OrderSerializer, UserSerializer, CategorySerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer


class PaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1) Validar campos requeridos
        for field in ('order_id', 'method', 'amount'):
            if field not in request.data:
                return Response(
                    {'error': f'Falta el campo "{field}".'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        order_id = request.data['order_id']
        method   = request.data['method']
        amount_raw = request.data['amount']

        # 2) Validar que el monto sea un número decimal válido
        try:
            amount = Decimal(str(amount_raw))
            if amount <= 0:
                raise InvalidOperation
        except (InvalidOperation, TypeError):
            return Response(
                {'error': 'El monto proporcionado no es válido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3) Recuperar el pedido asegurando pertenencia al usuario
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Pedido no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 4) Procesar pago dentro de transacción atómica
        with transaction.atomic():
            payment = Payment.objects.create(
                order=order,
                amount=amount,
                method=method,
                status='pagado',
                paid_at=now()
            )
            # Opcional: actualizar estado del pedido
            order.status = 'pagado'
            order.save(update_fields=['status'])

        # 5) Responder al cliente
        return Response(
            {
                'status': payment.status,
                'transaction_id': f"{method.upper()}-{payment.id}",
                'paid_at': payment.paid_at
            },
            status=status.HTTP_201_CREATED
        )


class CatalogView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        category_id = self.request.query_params.get('category')
        if category_id:
            return Product.objects.filter(category_id=category_id)
        return Product.objects.all()


# --------------------------------------------------
#  Vistas para el carrito de compras
# --------------------------------------------------

class CartItemListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        user     = self.request.user
        product  = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)

        if quantity > product.quantity:
            raise ValidationError(f"Solo quedan {product.quantity} unidades en stock.")

        existing = CartItem.objects.filter(user=user, product=product).first()
        if existing:
            new_qty = existing.quantity + quantity
            if new_qty > product.quantity:
                raise ValidationError(f"Solo quedan {product.quantity} unidades en stock.")
            existing.quantity = new_qty
            existing.save()
            serializer.instance = existing
        else:
            cart_item = CartItem.objects.create(user=user, product=product, quantity=quantity)
            serializer.instance = cart_item


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/cart/<pk>/  → (Opcional) Obtener un solo ítem de carrito
    PATCH  /api/cart/<pk>/  → Actualizar cantidad de un ítem del carrito
    DELETE /api/cart/<pk>/  → Eliminar un ítem del carrito
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        # Solo permitimos CRUD sobre ítems propios del usuario autenticado
        return CartItem.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        # Actualiza el campo quantity (el serializador valida que sea ≥1)
        serializer.save()

    def perform_destroy(self, instance):
        # Elimina el CartItem
        instance.delete()


class CreateOrderView(APIView):
    """
    POST /api/orders/ 
    → Toma todos los ítems del carrito del usuario autenticado,
      crea un Order + líneas OrderItem, vacía el carrito, y devuelve el pedido.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        cart_items = CartItem.objects.filter(user=user)

        if not cart_items.exists():
            return Response({'error': 'El carrito está vacío.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # 1. Crear el pedido
        order = Order.objects.create(user=user)

        # 2. Recorrer cada CartItem, crear OrderItem y sumar total
        for ci in cart_items:
            product = ci.product
            if ci.quantity > product.quantity:
                raise ValidationError(f"Stock insuficiente para {product.name}. Quedan {product.quantity}.")

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=ci.quantity,
                price=product.price
            )

            product.quantity -= ci.quantity
            product.save()

                # 3. Vaciar el carrito del usuario
        cart_items.delete()

        # 4. Serializar y devolver el pedido recién creado
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CategoryListAPIView(generics.ListAPIView):
    """
    GET /api/categories/
    Devuelve todas las categorías (id + name).
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/orders/<id>/
    Recupera los detalles de un pedido existente,
    solo si pertenece al usuario autenticado.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo devolvemos las órdenes del usuario autenticado
        return Order.objects.filter(user=self.request.user)
    

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ser = UserSerializer(request.user, context={'request': request})
        return Response(ser.data)

        
class UserOrdersListView(APIView):
    """
    GET  /api/orders/user/
    → Lista todos los pedidos del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer_class = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer_class.data)
    

