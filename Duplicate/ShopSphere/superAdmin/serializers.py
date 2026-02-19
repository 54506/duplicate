from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()
from vendor.models import VendorProfile, Product, ProductImage
from .models import VendorApprovalLog, ProductApprovalLog, DeliveryAgentApprovalLog
from deliveryAgent.models import DeliveryAgentProfile

class VendorApprovalLogSerializer(serializers.ModelSerializer):
    admin_user_name = serializers.CharField(source='admin_user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = VendorApprovalLog
        fields = [
            'id', 'vendor', 'admin_user', 'admin_user_name', 'action',
            'action_display', 'reason', 'timestamp'
        ]
        read_only_fields = ['id', 'admin_user', 'timestamp']

class ProductApprovalLogSerializer(serializers.ModelSerializer):
    admin_user_name = serializers.CharField(source='admin_user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = ProductApprovalLog
        fields = [
            'id', 'product', 'admin_user', 'admin_user_name', 'action',
            'action_display', 'reason', 'timestamp'
        ]
        read_only_fields = ['id', 'admin_user', 'timestamp']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'uploaded_at']

class AdminVendorDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    approval_logs = VendorApprovalLogSerializer(source='approval_logs.all', many=True, read_only=True)
    
    class Meta:
        model = VendorProfile
        fields = [
            'id', 'user_username', 'user_email', 'user_phone', 'shop_name', 'shop_description',
            'address', 'business_type', 'id_type', 'id_number', 'id_proof_file',
            'gst_number', 'pan_number', 'pan_name', 'pan_card_file',
            'bank_holder_name', 'bank_account_number', 'bank_ifsc_code', 'shipping_fee',
            'approval_status', 'approval_status_display', 'rejection_reason',
            'is_blocked', 'blocked_reason', 'created_at', 'approval_logs'
        ]

class AdminProductDetailSerializer(serializers.ModelSerializer):
    vendor_shop_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    vendor_owner = serializers.CharField(source='vendor.user.username', read_only=True)
    approval_logs = ProductApprovalLogSerializer(source='approval_logs.all', many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'vendor', 'vendor_shop_name', 'vendor_owner', 'name',
            'description', 'price', 'quantity', 'image', 'status',
            'is_blocked', 'blocked_reason', 'created_at', 'approval_logs'
        ]

class AdminVendorListSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    
    class Meta:
        model = VendorProfile
        fields = [
            'id', 'shop_name', 'user_email', 'approval_status',
            'approval_status_display', 'is_blocked', 'created_at'
        ]

class AdminProductListSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'vendor', 'vendor_name', 
            'price', 'quantity', 'status', 'images', 'is_blocked', 'created_at'
        ]

class ApproveVendorSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)

class RejectVendorSerializer(serializers.Serializer):
    reason = serializers.CharField()

class BlockVendorSerializer(serializers.Serializer):
    reason = serializers.CharField()

class UnblockVendorSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)

class BlockProductSerializer(serializers.Serializer):
    reason = serializers.CharField()

class UnblockProductSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
class DeliveryAgentApprovalLogSerializer(serializers.ModelSerializer):
    admin_user_name = serializers.CharField(source='admin_user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = DeliveryAgentApprovalLog
        fields = [
            'id', 'agent', 'admin_user', 'admin_user_name', 'action',
            'action_display', 'reason', 'timestamp'
        ]
        read_only_fields = ['id', 'admin_user', 'timestamp']

class AdminDeliveryAgentDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    approval_logs = DeliveryAgentApprovalLogSerializer(source='approval_logs.all', many=True, read_only=True)
    
    class Meta:
        model = DeliveryAgentProfile
        fields = [
            'id', 'user_username', 'user_email', 'phone_number', 'date_of_birth',
            'address', 'city', 'state', 'postal_code', 'vehicle_type',
            'vehicle_number', 'vehicle_registration', 'vehicle_insurance',
            'license_number', 'license_file', 'license_expires',
            'id_type', 'id_number', 'id_proof_file',
            'bank_holder_name', 'bank_account_number', 'bank_ifsc_code', 'bank_name',
            'approval_status', 'approval_status_display', 'rejection_reason',
            'is_blocked', 'blocked_reason', 'created_at', 'approval_logs'
        ]

class AdminDeliveryAgentListSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    
    class Meta:
        model = DeliveryAgentProfile
        fields = [
            'id', 'user_email', 'phone_number', 'vehicle_type',
            'approval_status', 'approval_status_display', 'is_blocked', 'created_at'
        ]

class ApproveDeliveryAgentSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)

class RejectDeliveryAgentSerializer(serializers.Serializer):
    reason = serializers.CharField()

class BlockDeliveryAgentSerializer(serializers.Serializer):
    reason = serializers.CharField()

class UnblockDeliveryAgentSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
