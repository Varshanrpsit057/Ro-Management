import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../api";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const productId = searchParams.get("product") || "";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // If user is already logged in as admin, just redirect
  useEffect(() => {
    const token = localStorage.getItem("ro_token");
    if (token) {
      if (redirect === "checkout") {
        navigate(productId ? `/product/${productId}` : "/cart");
      } else {
        navigate("/");
      }
    }
  }, []);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

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
      if (redirect === "checkout") {
        navigate(productId ? `/product/${productId}` : "/cart");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: "🚚", text: "Free delivery in Morappur & Dharmapuri" },
    { icon: "🔧", text: "Professional installation included" },
    { icon: "🛡️", text: "Manufacturer warranty on all products" },
    { icon: "💧", text: "Free water quality check" },
    { icon: "📞", text: "Dedicated after-sales support" },
  ];

  return (
    <div className="customer-register-page">
      <div className="cr-container">
        {/* Left: Info Panel */}
        <motion.div
          className="cr-info-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2>Welcome to ACS RO Water Systems</h2>
          <p>Create your account to enjoy seamless ordering, service booking, and exclusive offers.</p>
          <ul className="cr-benefits">
            {benefits.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="cr-benefit-icon">{b.icon}</span>
                {b.text}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right: Registration Form */}
        <motion.div
          className="cr-form-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          <h3>{redirect === "checkout" ? "Register to Checkout" : "Create Account"}</h3>
          <p>
            {redirect === "checkout"
              ? "Register to complete your purchase. Already have an account?"
              : "Join ACS for the best RO water solutions."}
          </p>

          {error && (
            <motion.div className="alert alert-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "0.5rem" }}>
              {error}
            </motion.div>
          )}

          <motion.form className="cr-form" onSubmit={handleSubmit} variants={stagger} initial="hidden" animate="show">
            <motion.div className="cr-input-group" variants={fadeUp}>
              <span className="cr-input-icon">👤</span>
              <input
                required
                placeholder="Full Name *"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
              />
            </motion.div>

            <motion.div className="cr-input-group" variants={fadeUp}>
              <span className="cr-input-icon">📧</span>
              <input
                required
                type="email"
                placeholder="Email Address *"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </motion.div>

            <motion.div className="cr-input-group" variants={fadeUp}>
              <span className="cr-input-icon">📱</span>
              <input
                required
                type="tel"
                placeholder="Phone Number *"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </motion.div>

            <motion.div className="cr-input-group" variants={fadeUp}>
              <span className="cr-input-icon">🏙️</span>
              <input
                placeholder="City / Area"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </motion.div>

            <motion.div className="cr-input-group" variants={fadeUp}>
              <span className="cr-input-icon">🔑</span>
              <input
                required
                placeholder="Choose a Username *"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                minLength={3}
              />
            </motion.div>

            <motion.div className="cr-input-group" variants={fadeUp}>
              <span className="cr-input-icon">🔒</span>
              <input
                required
                type="password"
                placeholder="Create Password * (min 4 chars)"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                minLength={4}
              />
            </motion.div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-lg cr-submit"
              style={{ width: "100%" }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              variants={fadeUp}
            >
              {loading ? "Creating Account..." : redirect === "checkout" ? "Register & Continue to Checkout" : "Create Account"}
            </motion.button>
          </motion.form>

          <p className="cr-footer-text">
            Already have an account?{" "}
            <Link to={redirect === "checkout" ? `/login?redirect=checkout&product=${productId}` : "/login"}>
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
