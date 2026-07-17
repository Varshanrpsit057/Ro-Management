import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchNotifications, logoutUser } from "../api";

export default function Layout({ children }) {
  const [overdueCount, setOverdueCount] = useState(0);
  const [username, setUsername] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("ro_user") || "{}");
    setUsername(user.username || "");
  }, []);

  useEffect(() => {
    fetchNotifications()
      .then((data) => setOverdueCount(data.overdue.length))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    localStorage.removeItem("ro_token");
    localStorage.removeItem("ro_user");
    navigate("/login");
  };

  const navItems = [
    { path: "/admin/", label: "Dashboard", icon: "📊" },
    { path: "/admin/customers", label: "Customers", icon: "👥" },
    { path: "/admin/products", label: "Products", icon: "📦" },
    { path: "/admin/notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ACS RO Manager</h2>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path || (item.path !== "/admin/" && location.pathname.startsWith(item.path)) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === "Notifications" && overdueCount > 0 && (
                <span className="badge">{overdueCount}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h1>RO Water Service Manager</h1>
          <div className="topbar-right">
            <span className="user-badge">{username}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
          </div>
        </header>
        <motion.div
          className="content"
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
