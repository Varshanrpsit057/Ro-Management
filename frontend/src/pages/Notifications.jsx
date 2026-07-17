import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchNotifications } from "../api";

export default function Notifications() {
  const [data, setData] = useState({ upcoming: [], overdue: [] });
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    fetchNotifications()
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  const renderTable = (list, emptyMsg) => {
    if (list.length === 0) return (
      <div className="empty-state">
        <div className="empty-state-icon">{tab === "upcoming" ? "📅" : "✓"}</div>
        <h3>{emptyMsg}</h3>
      </div>
    );
    return (
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Customer</th><th>Phone</th><th>System</th><th>Filter Type</th><th>Replaced</th><th>Next Due</th></tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}><Link to="/admin/customers" className="link">{item.customer_name}</Link></td>
                <td>{item.customer_phone}</td>
                <td>{item.model_name}</td>
                <td><span className="filter-tag">{item.filter_type.replace("_", " ")}</span></td>
                <td>{new Date(item.replaced_date).toLocaleDateString()}</td>
                <td className={tab === "overdue" ? "text-danger" : "text-warning"}>
                  {new Date(item.next_due_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2>Notifications</h2>
      <div className="tabs" style={{ marginTop: "1rem" }}>
        <button className={`tab ${tab === "upcoming" ? "active" : ""}`} onClick={() => setTab("upcoming")}>
          Upcoming ({data.upcoming.length})
        </button>
        <button className={`tab ${tab === "overdue" ? "active" : ""}`} onClick={() => setTab("overdue")}>
          Overdue ({data.overdue.length})
        </button>
      </div>
      <div style={{ marginTop: "1rem" }}>
        {tab === "upcoming"
          ? renderTable(data.upcoming, "No upcoming replacements in the next 7 days.")
          : renderTable(data.overdue, "No overdue replacements.")}
      </div>
    </motion.div>
  );
}
