from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .webpay_views import WebpayInitView, WebpayCommitView
from .views import (
    ProductViewSet,
    RegisterView,
    PaymentView,
    CatalogView,
    CartItemListCreateView,
    CartItemDetailView,
    CreateOrderView,
    CategoryListAPIView,
    OrderDetailView,
    UserProfileView,
    UserOrdersListView,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')

urlpatterns = [
    path('', include(router.urls)),

    # Autenticación JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Registro de usuario
    path('register/', RegisterView.as_view(), name='register'),

    # Catálogo completo de productos
    path('catalog/', CatalogView.as_view(), name='catalog'),

    # Carrito
    path('cart/', CartItemListCreateView.as_view(), name='cart-list-create'),
    path('cart/<int:pk>/', CartItemDetailView.as_view(), name='cart-detail'),

    # ** NUEVAS RUTAS: **
    # Crear pedido a partir del carrito
    path('orders/', CreateOrderView.as_view(), name='create-order'),

    # Recuperar detalle del pedido
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),

    # Listar mis pedidos (GET) /api/orders/user/
    path('orders/user/', UserOrdersListView.as_view(), name='user-orders'),

    # Procesar pago
    path('payments/', PaymentView.as_view(), name='payment'),
    
    # Inicia Webpay (POST { order_id })
    path('webpay/init/',   WebpayInitView.as_view(),   name='webpay-init'),
    path('webpay/commit/', WebpayCommitView.as_view(), name='webpay-commit'),

    # Categorías
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),

    # Perfil Usuario
    path('users/me/', UserProfileView.as_view(), name='user-profile'),

]
