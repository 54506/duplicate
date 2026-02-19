from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include('user.urls')),
    # Django Admin
    path('admin/', admin.site.urls),
    
    
    # API endpoints for each app
    path('vendor/', include('vendor.urls')),  # Template-based views
    path('api/vendor/', include('vendor.api_urls')),  # REST API endpoints
    path('superAdmin/', include('superAdmin.urls')),
    path('deliveryAgent/', include('deliveryAgent.urls')),
    path('api/delivery/', include('deliveryAgent.api_urls')),
]

# Serve media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
