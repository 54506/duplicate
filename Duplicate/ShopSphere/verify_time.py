import os
import django
import sys
from django.utils import timezone
import datetime

# Set up Django environment
sys.path.append(r'd:\e-commerce\Duplicate\ShopSphere')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ShopSphere.settings')
django.setup()

print(f"Current Settings:")
from django.conf import settings
print(f"TIME_ZONE: {settings.TIME_ZONE}")
print(f"USE_TZ: {settings.USE_TZ}")

print(f"\ntimezone.now(): {timezone.now()}")
print(f"datetime.now(): {datetime.datetime.now()}")
