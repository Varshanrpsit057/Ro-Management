import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const API = axios.create({ baseURL: "http://localhost:5000/api/store" });

export default function ROProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/categories?store_type=ro").then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { store_type: "ro" };
    if (selectedCategory) params.category = selectedCategory;
    if (search) params.search = search;
    API.get("/products", { params })
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const addToCart = async (product) => {
    let sid = localStorage.getItem("store_session");
    if (!sid) {
      sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      localStorage.setItem("store_session", sid);
    }
    await API.post("/cart", { session_id: sid, product_id: product.id, qty: 1 });
    const cnt = (parseInt(localStorage.getItem("cart_count") || "0", 10)) + 1;
    localStorage.setItem("cart_count", cnt.toString());
    window.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <div className="store-page">
      <section className="store-hero ro-hero-banner">
        <div className="store-hero-content fade-in">
          <h1>ACS RO Water Systems</h1>
          <p>Premium RO Purifiers • Filters • Membranes • Spare Parts • Service Kits</p>
        </div>
      </section>

      <div className="store-container">
        <div className="store-controls">
          <input
            type="text"
            placeholder="Search RO products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input store-search"
          />
          <div className="category-filters">
            <button className={`filter-chip ${!selectedCategory ? "active" : ""}`} onClick={() => setSelectedCategory("")}>All</button>
            {categories.map((cat) => (
              <button key={cat} className={`filter-chip ${selectedCategory === cat ? "active" : ""}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <p className="empty">No products found.</p>
        ) : (
          <div className="store-product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
