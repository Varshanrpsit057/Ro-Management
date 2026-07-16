import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = axios.create({ baseURL: "/api/store" });

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const sessionId = localStorage.getItem("store_session") || "";

  const loadCart = () => {
    if (!sessionId) { setCart([]); setLoading(false); return; }
    setLoading(true);
    API.get("/cart", { params: { session_id: sessionId } })
      .then((r) => {
        setCart(r.data);
        localStorage.setItem("cart_count", r.data.reduce((s, i) => s + i.qty, 0).toString());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (id, qty) => {
    await API.put(`/cart/${id}`, { qty });
    loadCart();
  };

  const removeItem = async (id) => {
    await API.delete(`/cart/${id}`);
    loadCart();
  };

  const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0);

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div className="store-page">
      <section className="store-hero cart-hero">
        <div className="store-hero-content fade-in">
          <h1>🛒 Shopping Cart</h1>
        </div>
      </section>
      <div className="store-container">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p className="empty">Your cart is empty.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
              <Link to="/ro-products" className="btn btn-primary">Browse RO Products</Link>
              <Link to="/ups-products" className="btn btn-secondary">Browse UPS Products</Link>
            </div>
          </div>
        ) : (
          <>
            <table className="table" style={{ marginBottom: "1.5rem" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <br /><small>{item.brand} • {item.category}</small>
                    </td>
                    <td>₹{parseFloat(item.price).toLocaleString("en-IN")}</td>
                    <td>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                    </td>
                    <td>₹{(parseFloat(item.price) * item.qty).toLocaleString("en-IN")}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => removeItem(item.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-summary">
              <h3>Total: ₹{total.toLocaleString("en-IN")}</h3>
              <button className="btn btn-primary" style={{ fontSize: "1.1rem", padding: "0.75rem 2rem" }}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
