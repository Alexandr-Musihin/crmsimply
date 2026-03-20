from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Contact, Deal
from .forms import RegisterForm, ContactForm, DealForm

def index(request):
    """Homepage describing the CRM"""
    return render(request, 'index.html')

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful.')
            return redirect('dashboard')
        messages.error(request, 'Registration failed. Please correct the errors.')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password.')
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('index')

@login_required
def dashboard(request):
    contacts = Contact.objects.filter(user=request.user)
    deals = Deal.objects.filter(user=request.user)
    return render(request, 'dashboard.html', {'contacts': contacts, 'deals': deals})

# Contact CRUD
@login_required
def contact_create(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            contact = form.save(commit=False)
            contact.user = request.user
            contact.save()
            messages.success(request, 'Contact added.')
            return redirect('dashboard')
    else:
        form = ContactForm()
    return render(request, 'contact_form.html', {'form': form, 'title': 'Add Contact'})

@login_required
def contact_edit(request, pk):
    contact = get_object_or_404(Contact, pk=pk, user=request.user)
    if request.method == 'POST':
        form = ContactForm(request.POST, instance=contact)
        if form.is_valid():
            form.save()
            messages.success(request, 'Contact updated.')
            return redirect('dashboard')
    else:
        form = ContactForm(instance=contact)
    return render(request, 'contact_form.html', {'form': form, 'title': 'Edit Contact'})

@login_required
def contact_delete(request, pk):
    contact = get_object_or_404(Contact, pk=pk, user=request.user)
    if request.method == 'POST':
        contact.delete()
        messages.success(request, 'Contact deleted.')
        return redirect('dashboard')
    return render(request, 'confirm_delete.html', {'object': contact, 'type': 'contact'})

# Deal CRUD
@login_required
def deal_create(request):
    if request.method == 'POST':
        form = DealForm(request.POST)
        if form.is_valid():
            deal = form.save(commit=False)
            deal.user = request.user
            deal.save()
            messages.success(request, 'Deal added.')
            return redirect('dashboard')
    else:
        form = DealForm()
        # Limit contacts to user's contacts
        form.fields['contact'].queryset = Contact.objects.filter(user=request.user)
    return render(request, 'deal_form.html', {'form': form, 'title': 'Add Deal'})

@login_required
def deal_edit(request, pk):
    deal = get_object_or_404(Deal, pk=pk, user=request.user)
    if request.method == 'POST':
        form = DealForm(request.POST, instance=deal)
        if form.is_valid():
            form.save()
            messages.success(request, 'Deal updated.')
            return redirect('dashboard')
    else:
        form = DealForm(instance=deal)
        form.fields['contact'].queryset = Contact.objects.filter(user=request.user)
    return render(request, 'deal_form.html', {'form': form, 'title': 'Edit Deal'})

@login_required
def deal_delete(request, pk):
    deal = get_object_or_404(Deal, pk=pk, user=request.user)
    if request.method == 'POST':
        deal.delete()
        messages.success(request, 'Deal deleted.')
        return redirect('dashboard')
    return render(request, 'confirm_delete.html', {'object': deal, 'type': 'deal'})