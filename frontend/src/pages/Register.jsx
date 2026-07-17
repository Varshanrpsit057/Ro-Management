import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      const { loginUser } = await import("../api");
      const data = await loginUser({ username: form.username, password: form.password });
      localStorage.setItem("ro_token", data.token);
      localStorage.setItem("ro_user", JSON.stringify(data.user));
      navigate("/admin/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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
          Create your account
        </motion.h3>

        {error && (
          <motion.div className="alert alert-error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label>Username *</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Choose a username"
            />
          </div>
          <div className="form-group">
            <label>Password * (min 4 chars)</label>
            <input
              required
              type="password"
              minLength={4}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Choose a password"
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
            {loading ? "Creating account..." : "Create Account"}
          </motion.button>
        </form>

        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.88rem", color: "var(--color-slate-500)" }}>
          Already have an account?{" "}
          <Link to="/login" className="link">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
