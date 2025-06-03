from django.contrib import admin
from .models import Product, Category, Stock, Order, OrderItem, Payment, User

admin.site.register(Product)
admin.site.register(Category)
admin.site.register(Stock)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(User)
