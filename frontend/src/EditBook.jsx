import { useState, useEffect } from "react";

export default function EditBook({ bookId, onClose, onBookUpdated }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Lấy dữ liệu sách hiện tại
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/book/${bookId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          title: data.title,
          author: data.author,
          price: data.price,
          quantity: data.quantity,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title || !formData.author || !formData.price || !formData.quantity) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Dùng PUT để cập nhật toàn bộ, PATCH để cập nhật 1 phần
    fetch(`http://127.0.0.1:8000/api/book/${bookId}/`, {
      method: "PATCH",  // hoặc "PUT"
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify({
        title: formData.title,
        author: formData.author,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi cập nhật sách");
        return res.json();
      })
      .then((data) => {
        setSuccess(true);
        onBookUpdated(data);
        setTimeout(() => onClose(), 2000); // đóng sau 2 giây
      })
      .catch((err) => setError(err.message));
  };

  if (loading) return <p>Đang tải...</p>;

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
        <h2>Chỉnh sửa sách</h2>

        {error && <p style={{ color: "red" }}>❌ {error}</p>}
        {success && <p style={{ color: "green" }}>✅ Cập nhật thành công!</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <br />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </div>

          <div>
            <label>Author:</label>
            <br />
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </div>

          <div>
            <label>Price:</label>
            <br />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </div>

          <div>
            <label>Quantity:</label>
            <br />
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}