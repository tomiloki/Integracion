from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_('Nombre de la categoría')
    )

    class Meta:
        verbose_name = _('Categoría')
        verbose_name_plural = _('Categorías')

    def __str__(self):
        return self.name


class Product(models.Model):
    sku = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('SKU')
    )
    brand = models.CharField(
        max_length=50,
        verbose_name=_('Marca')
    )
    internal_code = models.CharField(
        max_length=50,
        verbose_name=_('Código interno')
    )
    name = models.CharField(
        max_length=200,
        verbose_name=_('Nombre del producto')
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('Categoría')
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Precio (CLP)')
    )
    quantity = models.IntegerField(
        default=0,
        verbose_name=_('Cantidad en stock')
    )
    image = models.ImageField(
        upload_to='products/',
        null=True,
        blank=True,
        verbose_name=_('Imagen')
    )
    description = models.TextField(
        blank=True,
        verbose_name=_('Descripción técnica')
    )
    author = models.CharField(
        max_length=100,
        default='',
        help_text=_('Nombre del autor o persona que registró el producto'),
        verbose_name=_('Autor')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Fecha de creación')
    )

    class Meta:
        verbose_name = _('Producto')
        verbose_name_plural = _('Productos')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.brand}"


class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', _('Cliente Final')),
        ('distributor', _('Distribuidor')),
        ('admin', _('Administrador')),
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='customer',
        verbose_name=_('Rol de usuario')
    )

    class Meta:
        verbose_name = _('Usuario')
        verbose_name_plural = _('Usuarios')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Order(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name=_('Usuario')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Fecha de pedido')
    )
    status = models.CharField(
        max_length=20,
        default='pendiente',
        verbose_name=_('Estado del pedido')
    )

    class Meta:
        verbose_name = _('Pedido')
        verbose_name_plural = _('Pedidos')
        ordering = ['-created_at']

    def __str__(self):
        return _('Pedido #{id} de {user}').format(id=self.id, user=self.user.username)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Pedido')
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name=_('Producto')
    )
    quantity = models.PositiveIntegerField(
        verbose_name=_('Cantidad')
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Precio unitario (CLP)')
    )

    class Meta:
        verbose_name = _('Ítem de pedido')
        verbose_name_plural = _('Ítems de pedido')

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Payment(models.Model):
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        verbose_name=_('Pedido')
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Monto (CLP)')
    )
    method = models.CharField(
        max_length=50,
        verbose_name=_('Método de pago')
    )
    status = models.CharField(
        max_length=20,
        default='pendiente',
        verbose_name=_('Estado del pago')
    )
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Fecha de pago')
    )
    token_ws = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name='Token Webpay'
    )

    class Meta:
        verbose_name = _('Pago')
        verbose_name_plural = _('Pagos')

    def __str__(self):
        return _('Pago #{id} - {status}').format(id=self.id, status=self.status)


class CartItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name=_('Usuario')
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name=_('Producto')
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name=_('Cantidad')
    )
    added_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Fecha de agregado')
    )

    class Meta:
        unique_together = ('user', 'product')
        verbose_name = _('Ítem de carrito')
        verbose_name_plural = _('Ítems de carrito')

    def __str__(self):
        return f"{self.user.username} - {self.product.name} (x{self.quantity})"
