import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchProduct, createProduct, updateProduct } from "../api";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: "", description: "", price: "", stock_qty: 0, image_url: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchProduct(id)
        .then((p) => setForm({ ...p, price: String(p.price) }))
        .catch(() => navigate("/admin/products"));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, price: parseFloat(form.price), stock_qty: parseInt(form.stock_qty, 10) || 0 };
    try {
      if (isEdit) await updateProduct(id, payload);
      else await createProduct(payload);
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save product");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2>{isEdit ? "Edit Product" : "Add Product"}</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form card" style={{ marginTop: "1rem" }}>
        <div className="form-group">
          <label>Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Stock Qty</label>
            <input type="number" min="0" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/products")}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? "Update" : "Create"}</button>
        </div>
      </form>
    </motion.div>
  );
}
