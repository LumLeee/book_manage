import { useState } from "react";
import Login from "./Login";
import BookList from "./BookList";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access") // đã có token → bỏ qua trang login
  );

  return (
    <div>
      {isLoggedIn ? (
        <BookList />
      ) : (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}