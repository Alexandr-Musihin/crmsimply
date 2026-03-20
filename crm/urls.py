from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    # Contacts
    path('contact/create/', views.contact_create, name='contact_create'),
    path('contact/<int:pk>/edit/', views.contact_edit, name='contact_edit'),
    path('contact/<int:pk>/delete/', views.contact_delete, name='contact_delete'),
    # Deals
    path('deal/create/', views.deal_create, name='deal_create'),
    path('deal/<int:pk>/edit/', views.deal_edit, name='deal_edit'),
    path('deal/<int:pk>/delete/', views.deal_delete, name='deal_delete'),
]