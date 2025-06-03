# backend/api/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now

from .models import Product, User, Order, Payment, Stock, CartItem
from .serializers import ProductSerializer, UserRegisterSerializer, CartItemSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer


class PaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        method = request.data.get('method')
        amount = request.data.get('amount')

        order = Order.objects.get(id=order_id, user=request.user)
        payment = Payment.objects.create(
            order=order,
            amount=amount,
            method=method,
            status='pagado',
            paid_at=now()
        )
        return Response({
            'status': payment.status,
            'transaction_id': f"{method.upper()}-{payment.id}",
            'paid_at': payment.paid_at
        })


@api_view(['GET'])
def get_inventory(request, product_id):
    try:
        stock = Stock.objects.get(product_id=product_id)
        return Response({
            'product_id': product_id,
            'stock': stock.quantity,
            'last_updated': stock.updated_at
        })
    except Stock.DoesNotExist:
        return Response({'error': 'Producto sin stock'}, status=404)


class CatalogView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


# --------------------------------------------------
#  Vistas para el carrito de compras
# --------------------------------------------------

class CartItemListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/cart/       → Lista los ítems en el carrito del usuario autenticado
    POST /api/cart/       → Agrega un producto al carrito (o incrementa cantidad)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        # Solo devolvemos los CartItem del usuario que hace la petición
        return CartItem.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)
        user = self.request.user

        # Si ya existe un ítem para este user+product, incrementamos cantidad.
        cart_item, created = CartItem.objects.get_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        # DRF devolverá el CartItem actualizado en la respuesta
        return cart_item


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
