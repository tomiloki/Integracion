# backend/api/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    

class Product(models.Model):
    sku = models.CharField(max_length=50, unique=True)
    brand = models.CharField(max_length=50)
    internal_code = models.CharField(max_length=50)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.brand}"


class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Cliente Final'),
        ('distributor', 'Distribuidor'),
        ('admin', 'Administrador'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')

    def __str__(self):
        return f"{self.username} ({self.role})"


class Stock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock')
    quantity = models.IntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - {self.quantity} unidades"


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pendiente')

    def __str__(self):
        return f"Pedido #{self.id} de {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Precio al momento del pedido

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=50)  # Webpay, MercadoPago
    status = models.CharField(max_length=20, default='pendiente')
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Pago #{self.id} - {self.status}"


# ===============================
#  Nuevo modelo: CartItem
# ===============================
class CartItem(models.Model):
    """
    Cada CartItem asocia:
      - user: dueño del carrito (ForeignKey a User)
      - product: el producto agregado (ForeignKey a Product)
      - quantity: cantidad deseada
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        verbose_name = 'Ítem de Carrito'
        verbose_name_plural = 'Ítems de Carrito'

    def __str__(self):
        return f"{self.user.username} – {self.product.name} (x{self.quantity})"
