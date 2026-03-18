import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";
import "./Login.css";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const data = await login(email, password);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/vote");
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
    <div className="login-card">
      <h2 className="login-title page-title">Online Voting System</h2>
      <p className="login-subtitle">Sign in to access the voting portal</p>

      <div className="login-form">
        <input
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
      </div>

      <div className="login-footer">
        Don’t have an account? <a href="/register">Register</a>
      </div>
    </div>
  </div>
  );
}

export default Login;