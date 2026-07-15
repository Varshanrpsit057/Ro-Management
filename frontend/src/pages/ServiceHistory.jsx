import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSystem, fetchServiceHistory, fetchFilterReplacements, createServiceRecord, createFilterReplacement } from "../api";

export default function ServiceHistory() {
  const { id } = useParams();
  const [system, setSystem] = useState(null);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState([]);
  const [tab, setTab] = useState("history");
  const [showForm, setShowForm] = useState(false);

  // History form
  const [histForm, setHistForm] = useState({ service_date: "", description: "", cost: "" });
  // Filter replacement form
  const [filtForm, setFiltForm] = useState({
    filter_type: "sediment",
    replaced_date: "",
    cost: "",
    notes: "",
  });

  const load = () => {
    fetchSystem(id).then(setSystem);
    fetchServiceHistory(id).then(setHistory);
    fetchFilterReplacements(id).then(setFilters);
  };

  useEffect(() => load(), [id]);

  const handleHistorySubmit = async (e) => {
    e.preventDefault();
    await createServiceRecord(id, { ...histForm, cost: histForm.cost || null });
    setHistForm({ service_date: "", description: "", cost: "" });
    setShowForm(false);
    load();
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    await createFilterReplacement(id, { ...filtForm, cost: filtForm.cost || null });
    setFiltForm({ filter_type: "sediment", replaced_date: "", cost: "", notes: "" });
    load();
  };

  if (!system) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h2>Service History — {system.model_name}</h2>

      <div className="tabs" style={{ marginBottom: "1rem" }}>
        <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
          Service Records ({history.length})
        </button>
        <button className={`tab ${tab === "filters" ? "active" : ""}`} onClick={() => setTab("filters")}>
          Filter Replacements ({filters.length})
        </button>
      </div>

      {/* ---------- Service History Tab ---------- */}
      {tab === "history" && (
        <>
          {!showForm ? (
            <button className="btn btn-primary" style={{ marginBottom: "1rem" }} onClick={() => setShowForm(true)}>
              + Add Service Record
            </button>
          ) : (
            <form onSubmit={handleHistorySubmit} className="form card" style={{ marginBottom: "1rem" }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={histForm.service_date} onChange={(e) => setHistForm({ ...histForm, service_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Cost (₹)</label>
                  <input type="number" step="0.01" min="0" value={histForm.cost} onChange={(e) => setHistForm({ ...histForm, cost: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea required value={histForm.description} onChange={(e) => setHistForm({ ...histForm, description: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          )}
          {history.length === 0 ? (
            <p className="empty">No service records yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Description</th><th>Cost</th></tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{new Date(h.service_date).toLocaleDateString()}</td>
                    <td>{h.description}</td>
                    <td>{h.cost ? `₹${parseFloat(h.cost).toFixed(2)}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ---------- Filter Replacements Tab ---------- */}
      {tab === "filters" && (
        <>
          <form onSubmit={handleFilterSubmit} className="form card" style={{ marginBottom: "1rem" }}>
            <div className="form-row">
              <div className="form-group">
                <label>Filter Type *</label>
                <select value={filtForm.filter_type} onChange={(e) => setFiltForm({ ...filtForm, filter_type: e.target.value })}>
                  <option value="sediment">Sediment</option>
                  <option value="carbon">Carbon</option>
                  <option value="RO_membrane">RO Membrane</option>
                  <option value="post_carbon">Post Carbon</option>
                  <option value="UF">UF</option>
                  <option value="UV">UV</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Replaced Date *</label>
                <input type="date" required value={filtForm.replaced_date} onChange={(e) => setFiltForm({ ...filtForm, replaced_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Cost (₹)</label>
                <input type="number" step="0.01" min="0" value={filtForm.cost} onChange={(e) => setFiltForm({ ...filtForm, cost: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input value={filtForm.notes} onChange={(e) => setFiltForm({ ...filtForm, notes: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Add Replacement</button>
          </form>
          {filters.length === 0 ? (
            <p className="empty">No filter replacements yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Filter Type</th><th>Replaced</th><th>Next Due</th><th>Cost</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {filters.map((f) => (
                  <tr key={f.id}>
                    <td><span className="filter-tag">{f.filter_type.replace("_", " ")}</span></td>
                    <td>{new Date(f.replaced_date).toLocaleDateString()}</td>
                    <td className={new Date(f.next_due_date) < new Date() ? "text-danger" : ""}>
                      {new Date(f.next_due_date).toLocaleDateString()}
                    </td>
                    <td>{f.cost ? `₹${parseFloat(f.cost).toFixed(2)}` : "—"}</td>
                    <td>{f.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
