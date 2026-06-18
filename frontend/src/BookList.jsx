import { useState, useEffect } from "react";
import AddBook from "./AddBook";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [editBookId, setEditBookId] = useState(null);
  const [deleteBookId, setDeleteBookId] = useState(null); 
  const [deleteError, setDeleteError] = useState(null);

  const fetchBooks = () => {
    fetch("http://127.0.0.1:8000/api/book/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.results ?? data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBookAdded = (newBook) => {
    setBooks([...books, newBook]); // thêm sách mới vào danh sách
    // hoặc tải lại toàn bộ danh sách: fetchBooks();
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks(books.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    ));
  };

  const handleDeleteBook = (bookId) => {
    setDeleteError(null);

    fetch(`http://127.0.0.1:8000/api/book/${bookId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi xóa sách");
        
        // Xóa khỏi danh sách
        setBooks(books.filter(book => book.id !== bookId));
        setDeleteBookId(null);
        
        // Hiển thị thông báo thành công
        alert("✅ Xóa sách thành công!");
      })
      .catch((err) => {
        setDeleteError(err.message);
      });
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  const bookToDelete = books.find(b => b.id === deleteBookId);

  return (
    <div>
      <h1>Quản lý sách</h1>

      <AddBook onBookAdded={handleBookAdded} />
      
      <h2>Danh sách sách</h2>
      {books.length === 0 ? (
        <p>Không có sách nào</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.price}</td>
                <td>{book.quantity}</td>
                <td>
                  <button
                    onClick={() => setSelectedBookId(book.id)} // ← hiển thị detail
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => setEditBookId(book.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#FF9800",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteBookId(book.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedBookId && (
        <BookDetail
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
        />
      )}
      {editBookId && (
        <EditBook
          bookId={editBookId}
          onClose={() => setEditBookId(null)}
          onBookUpdated={handleBookUpdated}
        />
      )}
      {deleteBookId && bookToDelete && (
        <ConfirmDelete
          bookTitle={bookToDelete.title}
          onConfirm={() => handleDeleteBook(deleteBookId)}
          onCancel={() => {
            setDeleteBookId(null);
            setDeleteError(null);
          }}
        />
      )}

      {deleteError && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "#f44336",
          color: "white",
          padding: "15px",
          borderRadius: "4px",
        }}>
          ❌ {deleteError}
        </div>
      )}
    </div>
  );
}