import { useState, useEffect } from "react";

export default function BookDetail({ bookId, onClose }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/book/${bookId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookId]);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;
  if (!book) return <p>Không tìm thấy sách</p>;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        width: "90%",
      }}>
        <h2>{book.title}</h2>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Tác giả:</label>
          <p>{book.author}</p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Giá:</label>
          <p>${book.price}</p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Số lượng:</label>
          <p>{book.quantity}</p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>ID:</label>
          <p>{book.id}</p>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
            width: "100%",
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}