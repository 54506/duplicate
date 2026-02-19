import os
import django
import sys
from django.utils import timezone

# Set up Django environment
sys.path.append(r'd:\e-commerce\Duplicate\ShopSphere')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ShopSphere.settings')
django.setup()

from user.models import Order, Payment

def fix_missing_payments():
    # Fix missing payments
    orders_without_payment = Order.objects.filter(payment__isnull=True)
    for order in orders_without_payment:
        method = order.payment_method if order.payment_method in dict(Payment.PAYMENT_METHOD_CHOICES) else 'upi'
        Payment.objects.create(
            order=order,
            user=order.user,
            method=method,
            amount=order.total_amount,
            transaction_id=order.transaction_id or f"FIXED-{order.order_number}",
            status='completed',
            completed_at=order.created_at # Use order creation time as a guess or timezone.now()
        )
        order.payment_status = 'completed'
        order.save()
        print(f"Created missing payment for order {order.order_number}")

    # Fix existing payments missing completed_at
    payments_without_completed_at = Payment.objects.filter(completed_at__isnull=True, status='completed')
    for payment in payments_without_completed_at:
        payment.completed_at = payment.created_at # Default to created_at
        payment.save()
        print(f"Updated completed_at for payment {payment.transaction_id}")

if __name__ == "__main__":
    fix_missing_payments()
