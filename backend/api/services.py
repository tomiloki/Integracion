from decimal import Decimal, ROUND_HALF_UP


TAX_RATE = Decimal("0.19")


def quantize_clp(value: Decimal) -> Decimal:
    return Decimal(value).quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def compute_order_subtotal(order_items) -> Decimal:
    total = Decimal("0")
    for item in order_items:
        total += Decimal(item.quantity) * Decimal(item.price)
    return quantize_clp(total)


def compute_total_with_tax(subtotal: Decimal, tax_rate: Decimal = TAX_RATE) -> Decimal:
    total = Decimal(subtotal) * (Decimal("1") + tax_rate)
    return quantize_clp(total)


def compute_b2b_price(price: Decimal, discount_percent: float) -> Decimal:
    discount_factor = Decimal("1") - (Decimal(str(discount_percent)) / Decimal("100"))
    if discount_factor < 0:
        discount_factor = Decimal("0")
    return quantize_clp(Decimal(price) * discount_factor)
