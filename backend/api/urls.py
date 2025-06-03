# backend/api/urls.py

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet,
    RegisterView,
    PaymentView,
    CatalogView,
    get_inventory,
    CartItemListCreateView,   # noqa: F401
    CartItemDetailView,       # noqa: F401
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

    # Pagos (POST /api/payments/)
    path('payments/', PaymentView.as_view(), name='payment'),

    # Stock de inventario por producto
    path('inventory/<int:product_id>/', get_inventory, name='inventory'),

    # Catálogo completo de productos
    path('catalog/', CatalogView.as_view(), name='catalog'),

    # —————————————————————
    # RUTAS DEL CARRITO (añadidas):
    # —————————————————————

    # Listar y crear ítems en el carrito del usuario autenticado
    path('cart/', CartItemListCreateView.as_view(), name='cart-list-create'),

    # Detalle, actualización (cantidad) y eliminación de un ítem de carrito
    path('cart/<int:pk>/', CartItemDetailView.as_view(), name='cart-detail'),
]
