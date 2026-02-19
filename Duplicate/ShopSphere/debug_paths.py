import sys
import os

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ShopSphere.settings')
import django
django.setup()

import user
import user.urls
from django.conf import settings
from django.urls import get_resolver

output_file = "debug_output.txt"

with open(output_file, "w", encoding="utf-8") as f:
    f.write(f"sys.path: {sys.path}\n")
    f.write(f"user file: {user.file}\n")
    f.write(f"user.urls file: {user.urls.file}\n")

    resolver = get_resolver()
    f.write("URL Patterns:\n")
    for pattern in resolver.url_patterns:
        f.write(f"{pattern}\n")