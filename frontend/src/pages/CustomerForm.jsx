import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchCustomer, createCustomer, updateCustomer } from "../api";

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchCustomer(id).then(setForm).catch(() => navigate("/admin/customers"));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) await updateCustomer(id, form);
      else await createCustomer(form);
      navigate("/admin/customers");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save customer");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2>{isEdit ? "Edit Customer" : "Add Customer"}</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form card" style={{ marginTop: "1rem" }}>
        <div className="form-group">
          <label>Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phone *</label>
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/customers")}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? "Update" : "Create"}</button>
        </div>
      </form>
    </motion.div>
  );
}
