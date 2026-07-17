import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicLayout({ children }) {
  const [cartCount, setCartCount] = useState(() => parseInt(localStorage.getItem("cart_count") || "0", 10));
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setCartCount(parseInt(localStorage.getItem("cart_count") || "0", 10));
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/ro-products", label: "RO Products" },
    { path: "/ups-products", label: "UPS & Batteries" },
    { path: "/book-service", label: "Book Service" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <div className="public-layout">
      <header className={`public-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">ACS RO Water System</Link>
          <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? "✕" : "☰"}
          </button>
          <nav className="nav-links">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? "active" : ""}`}>
                {item.label}
              </Link>
            ))}
            <Link to="/cart" className="nav-item cart-link">
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </nav>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? "active" : ""}`}>
                  {item.label}
                </Link>
              ))}
              <Link to="/cart" className="nav-item">Cart {cartCount > 0 && `(${cartCount})`}</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main>{children}</main>
      <footer className="public-footer">
        <div className="footer-grid">
          <div>
            <h4>ACS RO Water System</h4>
            <p>Your trusted partner for pure water and reliable power since 2008. Serving Morappur, Dharmapuri with quality RO systems, service, and UPS solutions.</p>
          </div>
          <div>
            <h4>Contact</h4>
            <p>📍 Kambainallur Main Road, Opposite Bai Rice Mill, Morappur, Dharmapuri - 635305</p>
            <p>📞 9442878041 | 8838925135</p>
            <p>✉️ acsrowater@gmail.com</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <Link to="/ro-products">RO Products</Link>
            <Link to="/ups-products">UPS Products</Link>
            <Link to="/book-service">Book Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
        <p className="copyright">© 2008–2026 ACS RO Water System. All rights reserved. | Proprietor: Chennakrishnan .C</p>
      </footer>
    </div>
  );
}
