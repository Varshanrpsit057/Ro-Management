import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(setStats)
      .catch((err) => console.error(err));
  }, []);

  if (!stats) return <div className="loading">Loading dashboard...</div>;

  const cards = [
    { label: "Total Customers", value: stats.totalCustomers, link: "/customers", color: "#3b82f6" },
    { label: "Active RO Systems", value: stats.totalROSystems, link: "/customers", color: "#10b981" },
    { label: "Upcoming Replacements", value: stats.upcomingReplacements, link: "/notifications", color: "#f59e0b" },
    { label: "Overdue Replacements", value: stats.overdueReplacements, link: "/notifications", color: "#ef4444" },
    { label: "Available Products", value: stats.availableProducts, link: "/products", color: "#8b5cf6" },
  ];

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card-grid">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="stat-card" style={{ borderTopColor: card.color }}>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
