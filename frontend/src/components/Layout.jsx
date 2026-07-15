import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    try {
      await logoutUser();
    } catch {}
    localStorage.removeItem("ro_token");
    localStorage.removeItem("ro_user");
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/customers", label: "Customers", icon: "👥" },
    { path: "/products", label: "Products", icon: "📦" },
    { path: "/notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>💧 RO Manager</h2>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
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
            <span className="user-badge">👤 {username}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-secondary">
              Logout
            </button>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
