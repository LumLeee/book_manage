import { useState } from "react";

export default function AddBook({ onBookAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    quantity: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

    // Kiểm tra dữ liệu trống
    if (!formData.title || !formData.author || !formData.price || !formData.quantity) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    fetch("http://127.0.0.1:8000/api/book/", {
      method: "POST",
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
        if (!res.ok) throw new Error("Lỗi khi thêm sách");
        return res.json();
      })
      .then((data) => {
        setSuccess(true);
        setFormData({ title: "", author: "", price: "", quantity: "" }); // clear form
        onBookAdded(data); // báo BookList cập nhật danh sách
        setTimeout(() => setSuccess(false), 3000); // ẩn thông báo sau 3 giây
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div style={{ marginBottom: "30px", border: "1px solid #ccc", padding: "20px" }}>
      <h2>Thêm sách mới</h2>
      
      {error && <p style={{ color: "red" }}>❌ {error}</p>}
      {success && <p style={{ color: "green" }}>✅ Thêm sách thành công!</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <br />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tên sách"
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
            placeholder="Nhập tên tác giả"
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
            placeholder="Nhập giá"
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
            placeholder="Nhập số lượng"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Add Book
        </button>
      </form>
    </div>
  );
}