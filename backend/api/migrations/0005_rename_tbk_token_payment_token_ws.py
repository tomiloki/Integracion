# Generated by Django 5.2.1 on 2025-06-29 02:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_payment_tbk_token'),
    ]

    operations = [
        migrations.RenameField(
            model_name='payment',
            old_name='tbk_token',
            new_name='token_ws',
        ),
    ]
