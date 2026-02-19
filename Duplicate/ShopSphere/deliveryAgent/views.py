from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import AgentRegistrationForm
from .models import DeliveryAgentProfile

from .models import DeliveryAgentProfile, DeliveryAssignment
from django.db.models import Sum
from django.utils import timezone

# ===== Agent Portal View =====
def agent_portal(request):
    # If user is already logged in, redirect to dashboard
    if request.user.is_authenticated:
        return redirect('delivery_dashboard')

    login_form = AuthenticationForm()
    signup_form = AgentRegistrationForm()
    active_tab = 'signin'

    style = (
        'w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-[2rem] '
        'font-bold tracking-wide focus:border-[#5D56D1] outline-none transition-all'
    )
    for field in login_form.fields.values():
        field.widget.attrs.update({'class': style})

    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'signup':
            active_tab = 'signup'
            signup_form = AgentRegistrationForm(request.POST, request.FILES)

            if signup_form.is_valid():
                user = signup_form.save()
                # Do NOT log in the user immediately. They must wait for approval.
                messages.success(request, "Registration submitted! Please wait for administrator approval before logging in. 🚚")
                return redirect('agentPortal')
            else:
                messages.error(request, "Please fix the errors below.")

        elif action == 'login':
            active_tab = 'signin'
            login_form = AuthenticationForm(request, data=request.POST)
            for field in login_form.fields.values():
                field.widget.attrs.update({'class': style})

            if login_form.is_valid():
                user = login_form.get_user()
                
                # Check for approval before logging in
                if user.role == 'delivery':
                    try:
                        profile = user.delivery_agent_profile
                        if profile.approval_status != 'approved':
                            messages.error(request, "Your delivery partner account is pending admin approval.")
                            return redirect('agentPortal')
                    except Exception:
                        messages.error(request, "Delivery profile not found.")
                        return redirect('agentPortal')

                login(request, user)
                return redirect('delivery_dashboard')
            else:
                messages.error(request, "Invalid username or password.")

    return render(request, 'agent_portal.html', {
        'login_form': login_form,
        'signup_form': signup_form,
        'active_tab': active_tab,
    })


# ===== Delivery Dashboard View =====
@login_required
def delivery_dashboard(request):
    if request.user.role != 'delivery':
        messages.error(request, "Access restricted to delivery agents only.")
        return redirect('agentPortal')  # Changed from agent_portal to align with urls.py name 'agentPortal' if strictly required, but 'agentPortal' is name='agentPortal'

    try:
        agent = DeliveryAgentProfile.objects.get(user=request.user)
    except DeliveryAgentProfile.DoesNotExist:
        messages.error(request, "Delivery profile not found.")
        return redirect('agentPortal')

    # Final approval check
    if agent.approval_status != 'approved':
        messages.warning(request, "Your delivery account is still pending admin approval. Access is restricted for now.")
        logout(request) # Safety logout
        return redirect('agentPortal')
    
    # Active orders (Assigned but not yet delivered)
    # Correctly filter by assignment status
    active_assignments = DeliveryAssignment.objects.filter(
        agent=agent,
        status__in=['assigned', 'accepted', 'picked_up', 'in_transit']
    ).order_by('-assigned_at')

    # Available Orders (Not assigned yet? Or assigned to THIS agent specifically?)
    # Assuming 'Available' means assigned to this agent but not yet accepted
    available_orders = active_assignments.filter(status='assigned')

    # Recent delivered orders
    recent_deliveries = DeliveryAssignment.objects.filter(
        agent=agent,
        status='delivered'
    ).order_by('-completed_at')[:10]

    # Dashboard stats
    total_earnings = agent.total_earnings
    completed_orders_count = agent.completed_deliveries
    
    # Count of assigned orders pending acceptance
    available_orders_count = available_orders.count()

    return render(request, 'delivery_dashboard.html', {
        'user': request.user,
        'agent': agent,
        'available_orders': available_orders,
        'recent_orders': recent_deliveries,
        'total_earnings': total_earnings,
        'completed_orders_count': completed_orders_count,
        'available_orders_count': available_orders_count,
        'active_assignments': active_assignments
    })


@login_required
def accept_order_sim(request, order_id):
    """
    Refactored to check availability, though primarily we use accept_order.
    Using this as a specialized view if needed or redirecting to main logic.
    """
    return accept_order(request, order_id)


@login_required
def accept_order(request, order_id):
    if request.method == 'POST':
        try:
            agent = DeliveryAgentProfile.objects.get(user=request.user)
            # Find the assignment
            # Note: order_id here likely refers to the Order ID or Assignment ID? 
            # Looking at urls.py: path('delivery/accept-order/<int:order_id>/', views.accept_order)
            # It implies passing order ID. Let's assume it's the Order ID.
            
            assignment = get_object_or_404(DeliveryAssignment, order__id=order_id, agent=agent)

            if assignment.status == 'assigned':
                assignment.accept_delivery()
                messages.success(request, f"Order {assignment.order.order_number} accepted! Please proceed to pickup.")
            else:
                messages.warning(request, f"Order is already {assignment.status}.")
                
        except DeliveryAgentProfile.DoesNotExist:
            messages.error(request, "Agent profile not found.")
        except Exception as e:
             messages.error(request, f"Error: {str(e)}")
    else:
        messages.error(request, "Invalid request method.")

    return redirect('delivery_dashboard')