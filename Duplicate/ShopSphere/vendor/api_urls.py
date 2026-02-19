from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views as drf_views
from .api_views import (
    RegisterView, LoginView, VendorDetailsView, VendorDashboardView,
    VendorProfileDetailView, ProductViewSet, ApprovalStatusView, UserProfileView
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='api_register'),
    
    # Vendor endpoints
    path('profile/', VendorProfileDetailView.as_view(), name='api_vendor_profile'),
    path('details/', VendorDetailsView.as_view(), name='api_vendor_details'),
    path('dashboard/', VendorDashboardView.as_view(), name='api_vendor_dashboard'),
    path('approval-status/', ApprovalStatusView.as_view(), name='api_approval_status'),
    
    # User endpoints
    path('user/profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Products
    path('', include(router.urls)),
]