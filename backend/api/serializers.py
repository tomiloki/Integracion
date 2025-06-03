# backend/api/serializers.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Category, Product, User, CartItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'sku', 'brand', 'internal_code', 'name', 'category', 'price', 'created_at']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese correo.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Inyectamos el campo 'role' en el payload del access token
        token['role'] = user.role
        return token


# ===============================
#  Serializer para CartItem
# ===============================
class CartItemSerializer(serializers.ModelSerializer):
    # Mostramos el detalle completo del producto
    product = ProductSerializer(read_only=True)
    # Campo write-only para recibir el ID del producto al crear/actualizar
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True,
        help_text="ID del producto a agregar al carrito"
    )
    # Campo calculado para mostrar subtotal = quantity * product.price
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'product',
            'product_id',  # Solo para crear/actualizar
            'quantity',
            'subtotal',
        ]
        read_only_fields = ['id', 'product', 'subtotal']

    def get_subtotal(self, obj):
        return obj.quantity * obj.product.price

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1.")
        return value
