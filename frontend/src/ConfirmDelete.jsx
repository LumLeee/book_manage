export default function ConfirmDelete({ bookTitle, onConfirm, onCancel }) {
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
        maxWidth: "400px",
        width: "90%",
      }}>
        <h2>Xác nhận xóa</h2>
        <p>Bạn có chắc muốn xóa sách "<strong>{bookTitle}</strong>" không?</p>
        <p style={{ color: "red", fontSize: "12px" }}>⚠️ Hành động này không thể hoàn tác</p>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onConfirm}
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
            Xóa
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}