import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(form);
      localStorage.setItem("ro_token", data.token);
      localStorage.setItem("ro_user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>💧 RO Manager</h2>
        <h3>Login</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Username</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Login
          </button>
        </form>
        <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <Link to="/register" className="link">Register</Link>
        </p>

        {/* Quick login shortcuts for testing */}
        <div className="quick-login">
          <p className="quick-label">Quick Login (testing):</p>
          <div className="quick-btns">
            <button onClick={() => setForm({ username: "admin", password: "password123" })} className="btn btn-sm btn-secondary">admin</button>
            <button onClick={() => setForm({ username: "shop1", password: "password123" })} className="btn btn-sm btn-secondary">shop1</button>
            <button onClick={() => setForm({ username: "demo", password: "password123" })} className="btn btn-sm btn-secondary">demo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
