import json

from django.http import JsonResponse
from django.shortcuts import render
from .models import Book
from django.views.decorators.csrf import csrf_exempt
from .serializers import BookSerializer
from .validate.validate_create_book import vaidate_create_book
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

# Create your views here.
def get_request_data(request):
    if request.content_type and "application/json" in request.content_type:
        try:
            return json.loads(request.body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return None
    return request.POST.dict()

@csrf_exempt
@api_view(['GET', 'POST'])
def index(request):

    data = get_request_data(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    if request.method == "GET":
        data_queryset = Book.objects.all()
        data_books = BookSerializer(data_queryset, many=True)
        data = {
            "books": data_books.data,
            "message": "Hello, welcome!"
        }
        return JsonResponse(data )
    
    if request.method == 'POST':
        errors = vaidate_create_book(data)
        if errors:
            return JsonResponse(errors, status=400)

        data_books = BookSerializer(data=data)
        data_books.save()

        return JsonResponse({"book": data_books.data})
    return JsonResponse({'error': 'Invalid request method'})

@csrf_exempt
@api_view(['GET', 'POST', 'DELETE'])
def detail(request, id):

    data = get_request_data(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    if id is None:
        return JsonResponse({"error": "Invalid book ID"}, status=400)
    
    try:
        book = Book.objects.get(id=id)
    except Book.DoesNotExist:
        return JsonResponse({"error": "Book not found"}, status=404)

    if request.method == "GET": 
        return JsonResponse({"book": BookSerializer(book).data})

    if request.method == 'POST':
        data_books = BookSerializer(data=data)
        if not data_books.is_valid():
            return JsonResponse(data_books.errors, status=400)
        data_books.save()
        return JsonResponse({"book": data_books.data})
        
    if request.method == 'DELETE':
        book.delete()
        return JsonResponse({'message': 'Book deleted successfully'} )
    return JsonResponse({'error': 'Invalid request method'} )

# Viết bằng cách ModelViewSet
class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['title', 'author', 'price', 'quantity']

    def create(request):
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)
    
    def list(request):
        queryset = Book.objects.all()
        serializer = BookSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

        
    