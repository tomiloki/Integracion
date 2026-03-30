from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CartItem, Category, Order, OrderItem, Product, User
from .services import compute_b2b_price, compute_order_subtotal, compute_total_with_tax


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    effective_price = serializers.SerializerMethodField()
    is_b2b_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "brand",
            "internal_code",
            "name",
            "category",
            "price",
            "effective_price",
            "is_b2b_price",
            "created_at",
            "quantity",
            "image",
            "description",
            "author",
        ]
        read_only_fields = ["id", "created_at"]

    def _is_b2b_channel(self):
        request = self.context.get("request")
        channel = self.context.get("channel")
        if channel == "b2b":
            return True
        if not request or not request.user.is_authenticated:
            return False
        return request.user.role in {"distributor", "admin"}

    def get_effective_price(self, obj):
        if self._is_b2b_channel():
            return float(compute_b2b_price(obj.price, settings.B2B_DISCOUNT_PERCENT))
        return float(obj.price)

    def get_is_b2b_price(self, obj):
        return self._is_b2b_channel()


class ProductAdminSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category"
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "brand",
            "internal_code",
            "name",
            "category",
            "category_id",
            "price",
            "quantity",
            "image",
            "description",
            "author",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "category"]


class UserRegisterSerializer(serializers.ModelSerializer):
    PUBLIC_ROLE_CHOICES = (
        ("customer", "Cliente Final"),
        ("distributor", "Distribuidor"),
    )

    password = serializers.CharField(write_only=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=PUBLIC_ROLE_CHOICES)

    class Meta:
        model = User
        fields = ("username", "email", "password", "role")

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese correo.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["username"] = user.username
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "is_staff",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "is_staff", "date_joined", "last_login"]


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True,
        help_text="ID del producto a agregar al carrito"
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "subtotal"]
        read_only_fields = ["id", "product", "subtotal"]

    def get_subtotal(self, obj):
        return float(obj.product.price * obj.quantity)

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1.")
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["product", "quantity", "price"]

    def get_price(self, obj):
        return float(obj.price)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    total_with_tax = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["id", "created_at", "status", "items", "total", "total_with_tax"]
        read_only_fields = fields

    def get_total(self, obj):
        return float(compute_order_subtotal(obj.items.all()))

    def get_total_with_tax(self, obj):
        subtotal = compute_order_subtotal(obj.items.all())
        return float(compute_total_with_tax(subtotal))


class OrderAdminSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["id", "user", "status", "created_at", "items", "total"]

    def get_total(self, obj):
        return float(compute_order_subtotal(obj.items.all()))
