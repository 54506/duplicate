import os
import django
import smtplib

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ShopSphere.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("Attempting to send email...")
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")

try:
    result = send_mail(
        'Test Subject',
        'Test Body',
        settings.EMAIL_HOST_USER,
        [settings.EMAIL_HOST_USER], # Send to self
        fail_silently=False,
    )
    print(f"Result: {result}")
    if result == 1:
        print("Email sent successfully according to Django.")
    else:
        print("Email failed to send (return value 0).")

except smtplib.SMTPAuthenticationError as e:
    print(f"SMTP Authentication Error: {e}")
    print("Check your email and App Password.")
except Exception as e:
    print(f"An error occurred: {e}")