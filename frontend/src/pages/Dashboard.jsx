import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchDashboard, fetchNotifications } from "../api";
import axios from "axios";

const API = axios.create({ baseURL: "/api" });
API.interceptors.request.use((c) => { c.headers.Authorization = localStorage.getItem("ro_token") || ""; return c; });

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06 } }),
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifs, setNotifs] = useState({ upcoming: [], overdue: [] });

  useEffect(() => {
    fetchDashboard().then(setStats).catch(() => {});
    API.get("/admin/orders").then(r => setOrders(r.data)).catch(() => {});
    API.get("/admin/bookings").then(r => setBookings(r.data)).catch(() => {});
    fetchNotifications().then(setNotifs).catch(() => {});
  }, []);

  const revenueThisMonth = orders
    .filter(o => o.status !== "rejected")
    .reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;

  const cards = [
    { label: "Total Customers", value: stats?.totalCustomers || 0, link: "/admin/customers", color: "#2563eb", icon: "👥" },
    { label: "Active RO Systems", value: stats?.totalROSystems || 0, link: "/admin/customers", color: "#10b981", icon: "🔧" },
    { label: "Products in Stock", value: stats?.availableProducts || 0, link: "/admin/products", color: "#8b5cf6", icon: "📦" },
    { label: "Upcoming Replacements", value: stats?.upcomingReplacements || 0, link: "/admin/notifications", color: "#f59e0b", icon: "📅" },
    { label: "Overdue Replacements", value: stats?.overdueReplacements || 0, link: "/admin/notifications", color: "#ef4444", icon: "⚠️" },
    { label: "Pending Orders", value: pendingOrders, link: "/admin/orders", color: "#06b6d4", icon: "🛒" },
    { label: "Pending Bookings", value: pendingBookings, link: "/admin/bookings", color: "#ec4899", icon: "📋" },
    { label: "Revenue (Month)", value: `₹${revenueThisMonth.toLocaleString("en-IN")}`, link: "/admin/orders", color: "#14b8a6", icon: "💰" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h2>Dashboard</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--color-slate-500)", fontWeight: 500 }}>ACS RO Water System</span>
      </div>

      <div className="card-grid">
        {cards.map((card, i) => (
          <motion.div key={card.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <Link to={card.link} className="stat-card" style={{ borderLeft: `4px solid ${card.color}` }}>
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div className="dash-section" style={{ marginTop: "2.5rem" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="page-header">
          <h3>Recent Orders</h3>
          <span className="filter-chip" style={{ cursor: "default" }}>{orders.length} total</span>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No orders yet</h3>
            <p>Customer orders will appear here</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>#</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>#{o.id}</td>
                    <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                    <td>{o.customer_phone}</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(o.total_amount).toLocaleString("en-IN")}</td>
                    <td><span className={`status-tag status-${o.status}`}>{o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.75rem", marginTop: "2.5rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="page-header"><h3>Service Bookings</h3></div>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No bookings</h3>
              <p>Service bookings will appear here</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>Customer</th><th>Service</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.slice(0, 5).map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700 }}>#{b.id}</td>
                      <td style={{ fontWeight: 600 }}>{b.customer_name}</td>
                      <td><span className="filter-tag">{b.service_type.replace("_"," ")}</span></td>
                      <td><span className={`status-tag status-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="page-header"><h3>Filter Alerts</h3></div>
          <div className="notif-list">
            {notifs.overdue.length === 0 && notifs.upcoming.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem" }}>
                <p>All filters up to date ✓</p>
              </div>
            ) : (
              <>
                {notifs.overdue.slice(0,3).map(n => (
                  <div key={n.id} className="notif-item overdue">
                    <span>⚠️</span> <strong>{n.customer_name}</strong> — {n.filter_type.replace("_"," ")} overdue ({new Date(n.next_due_date).toLocaleDateString()})
                  </div>
                ))}
                {notifs.upcoming.slice(0,3).map(n => (
                  <div key={n.id} className="notif-item upcoming">
                    <span>📅</span> <strong>{n.customer_name}</strong> — {n.filter_type.replace("_"," ")} due {new Date(n.next_due_date).toLocaleDateString()}
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
