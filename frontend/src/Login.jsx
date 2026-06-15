import { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = () => {
    fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Sai tài khoản hoặc mật khẩu");
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("access", data.access);    // lưu token
        localStorage.setItem("refresh", data.refresh);
        onLoginSuccess();                                // báo App.jsx đã đăng nhập
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div>
      <h1>Đăng nhập</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Đăng nhập</button>
    </div>
  );
}