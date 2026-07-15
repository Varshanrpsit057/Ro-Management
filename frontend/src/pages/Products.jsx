import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, deleteProduct } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    fetchProducts(search)
      .then(setProducts)
      .catch((err) => console.error(err));
  };

  useEffect(() => load(), [search]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setDeleteId(null);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <Link to="/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      {products.length === 0 ? (
        <p className="empty">No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="product-image" />
              )}
              <div className="product-info">
                <h3>{p.name}</h3>
                <p className="product-desc">{p.description || "No description"}</p>
                <div className="product-meta">
                  <span className="product-price">₹{parseFloat(p.price).toFixed(2)}</span>
                  <span className={`stock-badge ${p.stock_qty > 0 ? "in-stock" : "out-of-stock"}`}>
                    {p.stock_qty > 0 ? `${p.stock_qty} in stock` : "Out of stock"}
                  </span>
                </div>
                <div className="product-actions">
                  <Link to={`/products/${p.id}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
                  <button onClick={() => setDeleteId(p.id)} className="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {deleteId && (
        <ConfirmDialog
          message="Delete this product?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
