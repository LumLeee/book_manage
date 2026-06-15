import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { useState, useEffect, useCallback } from "react";

const API = "http://127.0.0.1:8000/api";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  };
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Sai tài khoản hoặc mật khẩu");
      const data = await res.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginBox}>
        <h2 style={styles.loginTitle}>📚 Book Manager</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <button style={styles.btnPrimary} onClick={handleLogin} disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </div>
    </div>
  );
}

// ─── BOOK FORM (Add / Edit) ───────────────────────────────────────────────────
function BookForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial.title ?? "",
    author: initial.author ?? "",
    price: initial.price ?? "",
    quantity: initial.quantity ?? "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const isEdit = !!initial.id;
    const url = isEdit ? `${API}/book/${initial.id}/` : `${API}/book/`;
    try {
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(JSON.stringify(d));
      }
      const data = await res.json();
      onSave(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalBox}>
        <h3 style={{ marginTop: 0 }}>{initial.id ? "Cập nhật sách" : "Thêm sách mới"}</h3>
        {error && <p style={styles.error}>{error}</p>}
        {["title", "author", "price", "quantity"].map((k) => (
          <input
            key={k}
            style={styles.input}
            placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
            value={form[k]}
            onChange={set(k)}
            type={k === "price" || k === "quantity" ? "number" : "text"}
          />
        ))}
        <div style={styles.row}>
          <button style={styles.btnPrimary} onClick={handleSave} disabled={loading}>
            {loading ? "Đang lưu..." : "Save"}
          </button>
          <button style={styles.btnSecondary} onClick={onCancel}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function BookDetail({ book, onClose }) {
  return (
    <div style={styles.modal}>
      <div style={styles.modalBox}>
        <h3 style={{ marginTop: 0 }}>Chi tiết sách</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {[["ID", book.id], ["Title", book.title], ["Author", book.author],
              ["Price", book.price], ["Quantity", book.quantity]].map(([k, v]) => (
              <tr key={k}>
                <td style={styles.detailLabel}>{k}</td>
                <td style={styles.detailValue}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button style={{ ...styles.btnSecondary, marginTop: 16 }} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

// ─── BOOK LIST ────────────────────────────────────────────────────────────────
function BookList({ onLogout }) {
  const [books, setBooks] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({ title: "", author: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        page_size: pageSize,
        ...(filters.title && { title: filters.title }),
        ...(filters.author && { author: filters.author }),
      });
      const res = await fetch(`${API}/book/?${params}`, { headers: authHeaders() });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
      const data = await res.json();
      setBooks(data.results ?? data);
      setCount(data.count ?? (data.results ?? data).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, onLogout]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleDelete = async () => {
    try {
      await fetch(`${API}/book/${deleteId}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setDeleteId(null);
      fetchBooks();
    } catch {
      alert("Xóa thất bại");
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>📚 Book Manager</h2>
        <button style={styles.btnSecondary} onClick={onLogout}>Đăng xuất</button>
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        <input
          style={{ ...styles.input, flex: 1, marginBottom: 0 }}
          placeholder="Tìm theo Title..."
          value={filters.title}
          onChange={(e) => { setFilters((f) => ({ ...f, title: e.target.value })); setPage(1); }}
        />
        <input
          style={{ ...styles.input, flex: 1, marginBottom: 0 }}
          placeholder="Tìm theo Author..."
          value={filters.author}
          onChange={(e) => { setFilters((f) => ({ ...f, author: e.target.value })); setPage(1); }}
        />
        <button style={styles.btnPrimary} onClick={() => setShowAdd(true)}>+ Add Book</button>
      </div>

      {/* Error / Loading */}
      {error && <p style={styles.error}>{error}</p>}
      {loading && <p style={{ textAlign: "center" }}>Đang tải...</p>}

      {/* Table */}
      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Author</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 24 }}>Không có dữ liệu</td></tr>
              ) : books.map((book) => (
                <tr key={book.id} style={styles.tr}>
                  <td style={styles.td}>{book.title}</td>
                  <td style={styles.td}>{book.author}</td>
                  <td style={styles.td}>{book.price}</td>
                  <td style={styles.td}>{book.quantity}</td>
                  <td style={styles.td}>
                    <button style={styles.btnSmall} onClick={() => setDetailBook(book)}>Detail</button>
                    <button style={styles.btnSmall} onClick={() => setEditBook(book)}>Edit</button>
                    <button style={{ ...styles.btnSmall, ...styles.btnDanger }} onClick={() => setDeleteId(book.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div style={styles.pagination}>
        <span>Trang {page} / {totalPages || 1} — Tổng {count} sách</span>
        <div style={styles.row}>
          <select
            style={styles.select}
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            <option value={20}>20 / trang</option>
            <option value={100}>100 / trang</option>
          </select>
          <button style={styles.btnSecondary} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Previous</button>
          <button style={styles.btnSecondary} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <BookForm
          onSave={() => { setShowAdd(false); fetchBooks(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {editBook && (
        <BookForm
          initial={editBook}
          onSave={() => { setEditBook(null); fetchBooks(); }}
          onCancel={() => setEditBook(null)}
        />
      )}
      {detailBook && <BookDetail book={detailBook} onClose={() => setDetailBook(null)} />}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h3 style={{ marginTop: 0 }}>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa sách này không?</p>
            <div style={styles.row}>
              <button style={{ ...styles.btnPrimary, background: "#e53e3e" }} onClick={handleDelete}>Xóa</button>
              <button style={styles.btnSecondary} onClick={() => setDeleteId(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
  };

  return isLoggedIn
    ? <BookList onLogout={handleLogout} />
    : <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  row: { display: "flex", gap: 8 },
  input: { display: "block", width: "100%", padding: "8px 12px", marginBottom: 12, border: "1px solid #cbd5e0", borderRadius: 6, fontSize: 14, boxSizing: "border-box" },
  select: { padding: "6px 10px", border: "1px solid #cbd5e0", borderRadius: 6, fontSize: 14 },
  btnPrimary: { padding: "8px 18px", background: "#3182ce", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" },
  btnSecondary: { padding: "8px 18px", background: "#edf2f7", color: "#2d3748", border: "1px solid #cbd5e0", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  btnSmall: { padding: "4px 10px", marginRight: 4, background: "#edf2f7", border: "1px solid #cbd5e0", borderRadius: 4, cursor: "pointer", fontSize: 13 },
  btnDanger: { background: "#fff5f5", color: "#e53e3e", borderColor: "#feb2b2" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  thead: { background: "#edf2f7" },
  th: { padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #cbd5e0", fontWeight: 600 },
  td: { padding: "10px 12px", borderBottom: "1px solid #e2e8f0" },
  tr: { transition: "background 0.1s" },
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 8 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalBox: { background: "#fff", borderRadius: 10, padding: 28, minWidth: 340, maxWidth: 480, width: "100%" },
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7fafc" },
  loginBox: { background: "#fff", padding: 36, borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 320 },
  loginTitle: { textAlign: "center", marginTop: 0, marginBottom: 24 },
  error: { color: "#e53e3e", fontSize: 14, marginBottom: 12 },
  detailLabel: { padding: "8px 12px", fontWeight: 600, color: "#4a5568", width: 100 },
  detailValue: { padding: "8px 12px", color: "#2d3748" },
};