import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function PublicLayout({ children }) {
  const [cartCount] = useState(() => parseInt(localStorage.getItem("cart_count") || "0", 10));
  const location = useLocation();

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
      <header className="public-navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">💧 ACS RO Water System</Link>
          <nav className="nav-links">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? "active" : ""}`}>{item.label}</Link>
            ))}
            <Link to="/cart" className="nav-item cart-link">🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</Link>
          </nav>
        </div>
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
            <p>📍 Kambainallur Main Road,<br />Opposite Bai Rice Mill,<br />Morappur, Dharmapuri - 635305</p>
            <p>📞 9442878041 | 8838925135</p>
            <p>✉️ acsrowater@gmail.com</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <Link to="/ro-products">RO Products</Link><br />
            <Link to="/ups-products">UPS Products</Link><br />
            <Link to="/book-service">Book Service</Link><br />
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
        <p className="copyright">© 2008–2026 ACS RO Water System. All rights reserved. | Proprietor: Chennakrishnan .C</p>
      </footer>
    </div>
  );
}
