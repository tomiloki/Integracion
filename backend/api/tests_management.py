from decimal import Decimal

from django.core.management import call_command
from django.test import TestCase

from .models import Category, Product


class BootstrapPortfolioCommandTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Pruebas")
        self.in_stock_product = Product.objects.create(
            sku="SKU-IN-STOCK",
            brand="ACME",
            internal_code="IN-01",
            name="Producto con stock",
            category=self.category,
            price=Decimal("1000"),
            quantity=3,
            description="Item con stock positivo",
            author="tests",
        )
        self.out_of_stock_product = Product.objects.create(
            sku="SKU-OUT-STOCK",
            brand="ACME",
            internal_code="OUT-01",
            name="Producto sin stock",
            category=self.category,
            price=Decimal("2000"),
            quantity=0,
            description="Item agotado",
            author="tests",
        )

    def test_bootstrap_default_only_rebalances_out_of_stock(self):
        call_command("bootstrap_portfolio", "--skip-fixtures")

        self.in_stock_product.refresh_from_db()
        self.out_of_stock_product.refresh_from_db()

        self.assertEqual(self.in_stock_product.quantity, 3)
        self.assertGreater(self.out_of_stock_product.quantity, 0)

    def test_bootstrap_reset_stock_rebalances_entire_catalog(self):
        call_command("bootstrap_portfolio", "--skip-fixtures", "--reset-stock")

        self.in_stock_product.refresh_from_db()
        self.out_of_stock_product.refresh_from_db()

        self.assertNotEqual(self.in_stock_product.quantity, 3)
        self.assertGreaterEqual(self.in_stock_product.quantity, 8)
        self.assertGreaterEqual(self.out_of_stock_product.quantity, 8)
