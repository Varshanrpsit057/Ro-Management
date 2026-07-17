import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const productId = searchParams.get("product") || "";

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    const token = localStorage.getItem("ro_token");
    if (token) {
      if (redirect === "checkout") {
        navigate(productId ? `/product/${productId}` : "/cart");
      } else {
        navigate("/admin/");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ username: form.username, password: form.password });
      localStorage.setItem("ro_token", data.token);
      localStorage.setItem("ro_user", JSON.stringify(data.user));
      if (redirect === "checkout") {
        navigate(productId ? `/product/${productId}` : "/cart");
      } else {
        navigate("/admin/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    if (role === "admin") setForm({ username: "admin", password: "admin" });
    else if (role === "staff") setForm({ username: "staff", password: "staff" });
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
          {redirect === "checkout" ? "Sign in to checkout" : "Sign in to your account"}
        </motion.h3>

        {error && (
          <motion.div className="alert alert-error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Username or Email</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your username or email"
              autoComplete="username"
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
              autoComplete="current-password"
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
            {loading ? "Signing in..." : redirect === "checkout" ? "Sign In & Continue" : "Sign In"}
          </motion.button>
        </form>

        {redirect !== "checkout" && (
          <div className="quick-login">
            <div className="quick-label">Quick Access (Dev Only)</div>
            <div className="quick-btns">
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => quickLogin("admin")}>Admin</button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => quickLogin("staff")}>Staff</button>
            </div>
          </div>
        )}

        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.88rem", color: "var(--color-slate-500)" }}>
          Don't have an account?{" "}
          <Link
            to={redirect === "checkout" ? `/register?redirect=checkout&product=${productId}` : "/register"}
            className="link"
          >
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
