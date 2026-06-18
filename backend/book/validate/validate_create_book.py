
def vaidate_create_book(data):
    title = data.get("title")
    author = data.get("author")
    price = data.get("price")
    quantity = data.get("quantity")

    if not title:
        return {"error": "Title is required"}
    if not author:
        return {"error": "Author is required"}
    if not price:
        return {"error": "Price is required"}
    if not quantity:
        return {"error": "Quantity is required"}

    return None