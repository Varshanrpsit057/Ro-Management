import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(form);
      localStorage.setItem("ro_token", data.token);
      localStorage.setItem("ro_user", JSON.stringify(data.user));
      navigate("/admin/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          ACS RO Manager
        </motion.h2>
        <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Sign in to your account
        </motion.h3>

        {error && (
          <motion.div className="alert alert-error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Username</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
            />
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "0.5rem" }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.88rem", color: "var(--color-slate-500)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="link">Register</Link>
        </p>

        <div className="quick-login">
          <p className="quick-label">Quick Login (testing):</p>
          <div className="quick-btns">
            <button onClick={() => setForm({ username: "admin", password: "password123" })} className="btn btn-sm btn-secondary">admin</button>
            <button onClick={() => setForm({ username: "shop1", password: "password123" })} className="btn btn-sm btn-secondary">shop1</button>
            <button onClick={() => setForm({ username: "demo", password: "password123" })} className="btn btn-sm btn-secondary">demo</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
