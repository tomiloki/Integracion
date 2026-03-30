from decimal import Decimal
from unittest.mock import Mock, patch

import jwt
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CartItem, Category, Order, OrderItem, Payment, Product, User
from .services import compute_total_with_tax


class EcommerceApiTests(APITestCase):
    def setUp(self):
        self.password = "StrongPass123!"
        self.category = Category.objects.create(name="Frenos")
        self.product = Product.objects.create(
            sku="SKU-001",
            brand="ACME",
            internal_code="IC-001",
            name="Disco de freno",
            category=self.category,
            price=Decimal("10000"),
            quantity=20,
            description="Disco ventilado",
            author="seed",
        )
        self.customer = User.objects.create_user(
            username="customer1",
            email="customer@example.com",
            password=self.password,
            role="customer",
        )
        self.distributor = User.objects.create_user(
            username="dist1",
            email="dist@example.com",
            password=self.password,
            role="distributor",
        )
        self.admin = User.objects.create_user(
            username="admin1",
            email="admin@example.com",
            password=self.password,
            role="admin",
            is_staff=True,
        )

    def authenticate(self, username, password=None):
        pwd = password or self.password
        response = self.client.post("/api/token/", {"username": username, "password": pwd}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        return access

    def test_register_cannot_create_admin_role(self):
        response = self.client.post(
            "/api/register/",
            {
                "username": "new-admin",
                "email": "new-admin@example.com",
                "password": self.password,
                "role": "admin",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_contains_role_and_username(self):
        access = self.authenticate("customer1")
        payload = jwt.decode(access, options={"verify_signature": False})
        self.assertEqual(payload["role"], "customer")
        self.assertEqual(payload["username"], "customer1")

    def test_b2b_requires_distributor_or_admin(self):
        anon_response = self.client.get("/api/products/?channel=b2b")
        self.assertEqual(anon_response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.credentials()
        self.authenticate("dist1")
        response = self.client.get("/api/products/?channel=b2b")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data["results"]), 0)
        first_product = response.data["results"][0]
        self.assertTrue(first_product["is_b2b_price"])
        self.assertLess(first_product["effective_price"], float(first_product["price"]))

    def test_create_order_decrements_stock_and_clears_cart(self):
        self.authenticate("customer1")
        add_cart = self.client.post(
            "/api/cart/",
            {"product_id": self.product.id, "quantity": 3},
            format="json",
        )
        self.assertEqual(add_cart.status_code, status.HTTP_201_CREATED)

        response = self.client.post("/api/orders/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 17)
        self.assertEqual(CartItem.objects.filter(user=self.customer).count(), 0)

    @patch("api.webpay_views.requests.post")
    @patch("api.webpay_views.requests.put")
    def test_webpay_init_and_commit_flow(self, mock_put, mock_post):
        self.authenticate("customer1")

        order = Order.objects.create(user=self.customer, status=Order.STATUS_PENDING)
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=2,
            price=Decimal("10000"),
        )

        post_response = Mock()
        post_response.raise_for_status.return_value = None
        post_response.json.return_value = {
            "url": "https://webpay3gint.transbank.cl/mock",
            "token": "token-abc-123",
        }
        mock_post.return_value = post_response

        init_response = self.client.post("/api/webpay/init/", {"order_id": order.id}, format="json")
        self.assertEqual(init_response.status_code, status.HTTP_200_OK)

        payment = Payment.objects.get(order=order)
        self.assertEqual(payment.status, Payment.STATUS_INITIATED)

        expected_amount = int(compute_total_with_tax(Decimal("20000")))

        put_response = Mock()
        put_response.raise_for_status.return_value = None
        put_response.json.return_value = {
            "status": "AUTHORIZED",
            "buy_order": str(order.id),
            "amount": expected_amount,
            "authorization_code": "AUTH001",
        }
        mock_put.return_value = put_response

        self.client.credentials()
        commit_response = self.client.post(
            "/api/webpay/commit/",
            {"token_ws": "token-abc-123"},
            format="json",
        )
        self.assertEqual(commit_response.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(order.status, Order.STATUS_COMPLETED)
        self.assertEqual(payment.status, Payment.STATUS_PAID)

    def test_payment_endpoint_deprecated_and_admin_only(self):
        self.authenticate("customer1")
        forbidden_response = self.client.post("/api/payments/", {}, format="json")
        self.assertEqual(forbidden_response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.credentials()
        self.authenticate("admin1")
        deprecated_response = self.client.post("/api/payments/", {}, format="json")
        self.assertEqual(deprecated_response.status_code, status.HTTP_410_GONE)

    def test_webpay_return_redirects_token_to_frontend(self):
        response = self.client.post("/api/webpay/return/", {"token_ws": "token-xyz-1"})
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn("/checkout/success?token_ws=token-xyz-1", response["Location"])

    def test_webpay_return_redirects_cancelled_without_token(self):
        response = self.client.post("/api/webpay/return/", {"TBK_TOKEN": "tbk-cancel-1"})
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn("cancelled=1", response["Location"])
        self.assertIn("tbk_token=tbk-cancel-1", response["Location"])
