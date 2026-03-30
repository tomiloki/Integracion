import os
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management import BaseCommand, call_command

from api.models import Category, Product


class Command(BaseCommand):
    help = "Prepara datos demo para portafolio (usuarios base + fixture de productos)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-fixtures",
            action="store_true",
            help="No cargar fixture de productos/categorias.",
        )
        parser.add_argument(
            "--force-passwords",
            action="store_true",
            help="Forzar actualizacion de password en usuarios demo ya existentes.",
        )
        parser.add_argument(
            "--reset-stock",
            action="store_true",
            help="Reasigna stock demo en todo el catalogo (no solo agotados).",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Iniciando bootstrap de portafolio..."))

        if not options["skip_fixtures"]:
            self._load_products_fixture()

        self._ensure_demo_product()
        self._rebalance_catalog_stock(force_all=options["reset_stock"])
        self._ensure_demo_users(force_passwords=options["force_passwords"])
        self.stdout.write(self.style.SUCCESS("Bootstrap completado correctamente."))

    def _load_products_fixture(self):
        if Product.objects.exists():
            self.stdout.write("Fixture omitido: ya existen productos en la base de datos.")
            return

        call_command("loaddata", "api/fixtures/products.json")
        self.stdout.write(self.style.SUCCESS("Fixture de productos/categorias cargado."))

    def _ensure_demo_users(self, force_passwords: bool):
        User = get_user_model()
        users_to_ensure = [
            {
                "username": os.getenv("PORTFOLIO_ADMIN_USERNAME", "admin_portfolio"),
                "email": os.getenv("PORTFOLIO_ADMIN_EMAIL", "admin@autoparts.local"),
                "password": os.getenv("PORTFOLIO_ADMIN_PASSWORD", "Admin123!"),
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "username": os.getenv("PORTFOLIO_CUSTOMER_USERNAME", "cliente_demo"),
                "email": os.getenv("PORTFOLIO_CUSTOMER_EMAIL", "cliente@autoparts.local"),
                "password": os.getenv("PORTFOLIO_CUSTOMER_PASSWORD", "Cliente123!"),
                "role": "customer",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": os.getenv("PORTFOLIO_DISTRIBUTOR_USERNAME", "dist_demo"),
                "email": os.getenv("PORTFOLIO_DISTRIBUTOR_EMAIL", "dist@autoparts.local"),
                "password": os.getenv("PORTFOLIO_DISTRIBUTOR_PASSWORD", "DistDemo123!"),
                "role": "distributor",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": os.getenv("PORTFOLIO_CUSTOMER_QA_USERNAME", "cliente_qa"),
                "email": os.getenv("PORTFOLIO_CUSTOMER_QA_EMAIL", "cliente.qa@autoparts.local"),
                "password": os.getenv("PORTFOLIO_CUSTOMER_QA_PASSWORD", "ClienteQA123!"),
                "role": "customer",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": os.getenv("PORTFOLIO_DISTRIBUTOR_QA_USERNAME", "dist_qa"),
                "email": os.getenv("PORTFOLIO_DISTRIBUTOR_QA_EMAIL", "dist.qa@autoparts.local"),
                "password": os.getenv("PORTFOLIO_DISTRIBUTOR_QA_PASSWORD", "DistQA123!"),
                "role": "distributor",
                "is_staff": False,
                "is_superuser": False,
            },
        ]

        for payload in users_to_ensure:
            user, created = User.objects.get_or_create(
                username=payload["username"],
                defaults={
                    "email": payload["email"],
                    "role": payload["role"],
                    "is_staff": payload["is_staff"],
                    "is_superuser": payload["is_superuser"],
                },
            )

            needs_password_update = created or force_passwords
            if user.role != payload["role"]:
                user.role = payload["role"]
            if user.email != payload["email"]:
                user.email = payload["email"]
            if user.is_staff != payload["is_staff"]:
                user.is_staff = payload["is_staff"]
            if user.is_superuser != payload["is_superuser"]:
                user.is_superuser = payload["is_superuser"]
            if needs_password_update:
                user.set_password(payload["password"])
            user.save()

            action = "creado" if created else "actualizado"
            self.stdout.write(
                f"Usuario {action}: {payload['username']} ({payload['role']})"
            )

    def _ensure_demo_product(self):
        category, _ = Category.objects.get_or_create(name="Demo Portfolio")
        product, created = Product.objects.update_or_create(
            sku="PORT-DEMO-001",
            defaults={
                "brand": "AutoParts",
                "internal_code": "PORT-001",
                "name": "Kit Demo Frenos Premium",
                "category": category,
                "price": Decimal("99990.00"),
                "quantity": 25,
                "description": "Producto semilla para smoke tests y demostraciones de portafolio.",
                "author": "system-bootstrap",
            },
        )
        action = "creado" if created else "actualizado"
        self.stdout.write(f"Producto demo {action}: {product.sku}")

    def _rebalance_catalog_stock(self, force_all: bool = False):
        products_to_restock = Product.objects.all() if force_all else Product.objects.filter(quantity__lte=0)
        updated_count = 0
        for product in products_to_restock:
            # Distribucion deterministica para stock demo variado.
            product.quantity = 8 + (product.id % 7) * 4
            product.save(update_fields=["quantity"])
            updated_count += 1

        if force_all:
            self.stdout.write(f"Stock demo reseteado en {updated_count} productos.")
        else:
            self.stdout.write(f"Stock demo ajustado en {updated_count} productos.")
