import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/api";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const data = await register(name, email, password);
    if (data.message?.toLowerCase().includes("success")) {
      alert("Registration successful");
      navigate("/login");
    } else {
      alert(data.message || "Registration failed");
    }
  };

  return (
      <div className="register-page">
      <div className="register-card">
        <h2 className="register-title page-title">Create Account</h2>
        <p className="register-subtitle">Register to participate in the election</p>

        <div className="register-form">
          <input
            className="register-input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="register-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="register-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="register-button" onClick={handleRegister}>
            Register
          </button>
        </div>

        <p className="register-footer">
          Already have an account? <span onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;