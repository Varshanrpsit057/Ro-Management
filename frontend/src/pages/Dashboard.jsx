import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard, fetchNotifications } from "../api";
import axios from "axios";

const API = axios.create({ baseURL: "/api" });
API.interceptors.request.use((c) => { c.headers.Authorization = localStorage.getItem("ro_token") || ""; return c; });

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
    { label: "Total Customers", value: stats?.totalCustomers || 0, link: "customers", color: "#3b82f6", icon: "👥" },
    { label: "Active RO Systems", value: stats?.totalROSystems || 0, link: "customers", color: "#10b981", icon: "🔧" },
    { label: "Products in Stock", value: stats?.availableProducts || 0, link: "products", color: "#8b5cf6", icon: "📦" },
    { label: "Upcoming Replacements", value: stats?.upcomingReplacements || 0, link: "notifications", color: "#f59e0b", icon: "📅" },
    { label: "Overdue Replacements", value: stats?.overdueReplacements || 0, link: "notifications", color: "#ef4444", icon: "⚠️" },
    { label: "Pending Orders", value: pendingOrders, link: "orders", color: "#06b6d4", icon: "🛒" },
    { label: "Pending Bookings", value: pendingBookings, link: "bookings", color: "#ec4899", icon: "📋" },
    { label: "Revenue (Month)", value: `₹${revenueThisMonth.toLocaleString("en-IN")}`, link: "orders", color: "#14b8a6", icon: "💰" },
  ];

  return (
    <div>
      <h2>Dashboard — ACS RO Water System</h2>
      <div className="card-grid">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="stat-card glass" style={{ borderTopColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="dash-section" style={{ marginTop: "2rem" }}>
        <div className="page-header">
          <h3>Recent Orders</h3>
          <span className="filter-chip">{orders.length} total</span>
        </div>
        {orders.length === 0 ? <p className="empty">No orders yet.</p> :
          <table className="table glass">
            <thead><tr><th>#</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td><td>{o.customer_name}</td><td>{o.customer_phone}</td>
                  <td>₹{parseFloat(o.total_amount).toLocaleString("en-IN")}</td>
                  <td><span className={`status-tag status-${o.status}`}>{o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {/* Service Bookings + Notifications side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "2rem" }}>
        <div>
          <div className="page-header"><h3>Service Bookings</h3></div>
          {bookings.length === 0 ? <p className="empty">No bookings.</p> :
            <table className="table glass">
              <thead><tr><th>#</th><th>Customer</th><th>Service</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td><td>{b.customer_name}</td><td><span className="filter-tag">{b.service_type.replace("_"," ")}</span></td>
                    <td><span className={`status-tag status-${b.status === 'approved' ? 'active' : b.status === 'completed' ? 'active' : 'inactive'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
        <div>
          <div className="page-header"><h3>Filter Alerts</h3></div>
          <div className="notif-list glass">
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
            {notifs.overdue.length === 0 && notifs.upcoming.length === 0 && <p className="empty">All filters up to date.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
