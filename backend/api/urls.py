from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminCategoryViewSet,
    AdminMetricsView,
    AdminOrderViewSet,
    AdminPaymentViewSet,
    AdminProductViewSet,
    AdminUserViewSet,
    CartItemDetailView,
    CartItemListCreateView,
    CatalogView,
    CategoryListAPIView,
    CreateOrderView,
    CustomTokenObtainPairView,
    HealthCheckView,
    OrderDetailView,
    PaymentView,
    ProductViewSet,
    RegisterView,
    UserOrdersListView,
    UserProfileView,
)
from .webpay_views import WebpayCommitView, WebpayInitView, WebpayReturnView

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="products")
router.register(r"admin/categories", AdminCategoryViewSet, basename="admin-categories")
router.register(r"admin/products", AdminProductViewSet, basename="admin-products")
router.register(r"admin/orders", AdminOrderViewSet, basename="admin-orders")
router.register(r"admin/payments", AdminPaymentViewSet, basename="admin-payments")
router.register(r"admin/users", AdminUserViewSet, basename="admin-users")

urlpatterns = [
    path("", include(router.urls)),
    path("health/", HealthCheckView.as_view(), name="health-check"),

    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("register/", RegisterView.as_view(), name="register"),
    path("catalog/", CatalogView.as_view(), name="catalog"),

    path("cart/", CartItemListCreateView.as_view(), name="cart-list-create"),
    path("cart/<int:pk>/", CartItemDetailView.as_view(), name="cart-detail"),

    path("orders/", CreateOrderView.as_view(), name="create-order"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/user/", UserOrdersListView.as_view(), name="user-orders"),

    path("payments/", PaymentView.as_view(), name="payment-deprecated"),
    path("webpay/init/", WebpayInitView.as_view(), name="webpay-init"),
    path("webpay/return/", WebpayReturnView.as_view(), name="webpay-return"),
    path("webpay/commit/", WebpayCommitView.as_view(), name="webpay-commit"),

    path("categories/", CategoryListAPIView.as_view(), name="category-list"),
    path("users/me/", UserProfileView.as_view(), name="user-profile"),
    path("admin/metrics/", AdminMetricsView.as_view(), name="admin-metrics"),
]
