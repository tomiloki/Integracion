from django.contrib import admin
from .models import Product, Category, Order, OrderItem, Payment, User

admin.site.register(Product)
admin.site.register(Category)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(User)
