import json

from django.http import JsonResponse
from django.shortcuts import render
from .models import Book
from django.views.decorators.csrf import csrf_exempt
from .serializers import BookListSerializer
from .validate.validate_create_book import vaidate_create_book

# Create your views here.
def get_request_data(request):
    if request.content_type and "application/json" in request.content_type:
        try:
            return json.loads(request.body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return None
    return request.POST.dict()

@csrf_exempt
def index(request):

    data = get_request_data(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    if request.method == "GET":
        data_queryset = Book.objects.all()
        data_books = BookListSerializer(data_queryset, many=True)
        data = {
            "books": data_books.data,
            "message": "Hello, welcome!"
        }
        return JsonResponse(data )
    
    if request.method == 'POST':
        errors = vaidate_create_book(data)
        if errors:
            return JsonResponse(errors, status=400)

        title = data.get('title')
        author = data.get('author')
        price = data.get('price')
        quantity = data.get('quantity')

        book = Book.objects.create(title=title, author=author, price=price, quantity=quantity)

        return JsonResponse({"book": BookListSerializer(book).data})
    return JsonResponse({'error': 'Invalid request method'})

@csrf_exempt
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
        return JsonResponse({"book": BookListSerializer(book).data})

    if request.method == 'POST':
        book.title = data.get('title', book.title)
        book.author = data.get('author', book.author)
        book.price = data.get('price', book.price)
        book.quantity = data.get('quantity', book.quantity)
        book.save()
        return JsonResponse({"book": BookListSerializer(book).data})
        
    if request.method == 'DELETE':
        book.delete()
        return JsonResponse({'message': 'Book deleted successfully'} )
    return JsonResponse({'error': 'Invalid request method'} )