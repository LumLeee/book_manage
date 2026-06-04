from django.urls import path

from . import views

urlpatterns = [
    path('books', views.index, name='index'),
    path('books/<int:id>/', views.detail, name='detail'),
]