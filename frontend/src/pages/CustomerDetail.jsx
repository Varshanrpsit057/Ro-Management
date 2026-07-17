import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchCustomer, fetchCustomerSystems, deleteSystem, createSystem, updateSystem } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [systems, setSystems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editSystem, setEditSystem] = useState(null);
  const [form, setForm] = useState({ model_name: "", install_date: "", status: "active", notes: "" });
  const [deleteSysId, setDeleteSysId] = useState(null);

  const load = () => {
    fetchCustomer(id).then(setCustomer);
    fetchCustomerSystems(id).then(setSystems);
  };

  useEffect(() => load(), [id]);

  const handleSystemSubmit = async (e) => {
    e.preventDefault();
    if (editSystem) await updateSystem(editSystem.id, form);
    else await createSystem(id, form);
    setShowForm(false); setEditSystem(null);
    setForm({ model_name: "", install_date: "", status: "active", notes: "" });
    load();
  };

  const openEditSystem = (sys) => {
    setEditSystem(sys);
    setForm({ model_name: sys.model_name, install_date: sys.install_date || "", status: sys.status, notes: sys.notes || "" });
    setShowForm(true);
  };

  const handleDeleteSystem = async () => {
    if (deleteSysId) { await deleteSystem(deleteSysId); setDeleteSysId(null); load(); }
  };

  if (!customer) return <div className="loading">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h2>{customer.name}</h2>
        <Link to={`/admin/customers/${id}/edit`} className="btn btn-secondary">Edit Customer</Link>
      </div>
      <div className="detail-card">
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Address:</strong> {customer.address || "—"}</p>
      </div>

      <div className="page-header" style={{ marginTop: "1.75rem" }}>
        <h3>RO Systems ({systems.length})</h3>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditSystem(null); setForm({ model_name: "", install_date: "", status: "active", notes: "" }); }}>
          {showForm ? "Cancel" : "+ Add System"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSystemSubmit} className="form card" style={{ marginBottom: "1.25rem" }}>
          <div className="form-group">
            <label>Model Name *</label>
            <input required value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Install Date</label>
              <input type="date" value={form.install_date} onChange={(e) => setForm({ ...form, install_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">{editSystem ? "Update System" : "Add System"}</button>
        </form>
      )}

      {systems.length === 0 ? (
        <p className="empty">No RO systems registered.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Model</th><th>Installed</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {systems.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.model_name}</td>
                  <td>{s.install_date ? new Date(s.install_date).toLocaleDateString() : "—"}</td>
                  <td><span className={`status-tag status-${s.status}`}>{s.status}</span></td>
                  <td>
                    <Link to={`/admin/systems/${s.id}/history`} className="btn btn-sm btn-secondary">History</Link>
                    <button onClick={() => openEditSystem(s)} className="btn btn-sm btn-secondary">Edit</button>
                    <button onClick={() => setDeleteSysId(s.id)} className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteSysId && (
        <ConfirmDialog
          message="Delete this RO system and all its history?"
          onConfirm={handleDeleteSystem}
          onCancel={() => setDeleteSysId(null)}
        />
      )}
    </motion.div>
  );
}
