import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import LazyImage from "../components/LazyImage";

const API = axios.create({ baseURL: "/api/store" });
const BASE = import.meta.env.BASE_URL; // "/acs-varshan/"

function getProductImage(product) {
  const cat = product.category || "";
  const name = (product.name || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  if (cat === "Complete RO Systems" || name.includes("purifier")) {
    if (brand.includes("aquaguard")) {
      if (name.includes("marvel")) return `${BASE}images/ro-systems/aquaguard-marvel.jpg`;
      if (name.includes("aura")) return `${BASE}images/ro-systems/aquaguard-aura.jpg`;
      if (name.includes("aston")) return `${BASE}images/ro-systems/aquaguard-aston.jpg`;
      return `${BASE}images/ro-systems/aquaguard-marvel.jpg`;
    }
    if (brand.includes("kent")) {
      if (name.includes("grand")) return `${BASE}images/ro-systems/kent-grand-plus.jpg`;
      if (name.includes("pride")) return `${BASE}images/ro-systems/kent-pride.jpg`;
      if (name.includes("supreme")) return `${BASE}images/ro-systems/kent-supreme.jpg`;
      return `${BASE}images/ro-systems/kent-grand-plus.jpg`;
    }
    if (brand.includes("livpure")) return `${BASE}images/ro-systems/livpure-glo.jpg`;
    if (brand.includes("pureit")) return `${BASE}images/ro-systems/pureit-advanced.jpg`;
    if (brand.includes("grand aqua") || brand.includes("aqua grand")) return `${BASE}images/ro-systems/grand-aqua-domestic.jpg`;
    if (brand.includes("elpron")) return `${BASE}images/ro-systems/elpron-domestic.jpg`;
    return `${BASE}images/ro-systems/kent-grand-plus.jpg`;
  }
  if (cat === "Filters" || name.includes("filter")) return `${BASE}images/filters/PP filter.png`;
  if (cat === "Membranes" || name.includes("membrane")) return `${BASE}images/filters/2012-100-2012-100-Gpd-RO-Membrane-100gpd.avif`;
  if (cat === "Pumps" || name.includes("pump")) return `${BASE}images/pumps/booster-pump.jpg`;
  if (cat.includes("Batteries") || name.includes("battery")) return `${BASE}images/batteries/powerzone-battery.jpg`;
  if (cat.includes("UPS") || name.includes("ups") || name.includes("inverter")) return `${BASE}images/ups.svg`;
  return `${BASE}images/ro-system.svg`;
}

const demoReviews = [
  { name: "Rahul Sharma", rating: 5, date: "2026-06-15", comment: "Excellent purification quality. Water tastes great and the installation was professional.", badge: "Verified Buyer" },
  { name: "Priya Patel", rating: 5, date: "2026-05-20", comment: "Very quiet operation. Using it for 3 months now, absolutely no complaints.", badge: "Verified Buyer" },
  { name: "Amit Kumar", rating: 4, date: "2026-04-10", comment: "Worth every rupee. The mineral RO technology really makes a difference in taste.", badge: "Verified Buyer" },
  { name: "Sneha Reddy", rating: 5, date: "2026-03-28", comment: "Installation was quick and clean. The technician explained everything very well.", badge: "Verified Buyer" },
];

const specLabels = {
  capacity: "Capacity", purification_rate: "Purification Rate", power: "Power", weight: "Weight",
  voltage: "Voltage", pressure: "Pressure", flow: "Flow", wattage: "Wattage",
  backup: "Backup Time", life: "Life Span", rejection: "TDS Rejection",
  filtration: "Filtration", size: "Size", material: "Material", ports: "Ports",
  noise: "Noise Level", charging: "Charging", stages: "Stages", type: "Type",
  finish: "Finish", connection: "Connection", output: "Output", input: "Input",
  cut_off: "Cut-off", cut_in: "Cut-in", suitable: "Suitable For", dimensions: "Dimensions",
  warranty: "Warranty", color: "Color", current: "Current",
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => navigate("/ro-products"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading product details...</div>;
  if (!product) return null;

  const img = getProductImage(product);
  const images = [img];
  const specs = product.specs || {};

  const addToCart = async () => {
    let sid = localStorage.getItem("store_session");
    if (!sid) { sid = crypto.randomUUID?.() || Math.random().toString(36).slice(2); localStorage.setItem("store_session", sid); }
    try { await API.post("/cart", { session_id: sid, product_id: product.id, qty: 1 }); } catch {}
    setAdded(true);
    const cnt = (parseInt(localStorage.getItem("cart_count") || "0", 10)) + 1;
    localStorage.setItem("cart_count", cnt.toString());
    window.dispatchEvent(new Event("cart-updated"));
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-detail-page">
      <div className="pd-container">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link> / <Link to={product.store_type === "ups" ? "/ups-products" : "/ro-products"}>{product.store_type === "ups" ? "UPS & Batteries" : "RO Products"}</Link> / <span>{product.name}</span>
        </div>

        <div className="pd-main">
          {/* Gallery */}
          <motion.div className="pd-gallery" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="pd-main-image" onClick={() => setLightboxOpen(true)}>
              <LazyImage src={images[activeImage]} alt={product.name} containerClassName="pd-lazy-wrap" className="pd-main-img" objectFit="contain" fallbackSrc={`${BASE}images/ro-system.svg`} />
              <div className="pd-zoom-hint">🔍 Click to zoom</div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div className="pd-info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <span className="product-category-tag">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="pd-brand">{product.brand} {product.model && `• ${product.model}`}</p>
            <div className="pd-rating-row">
              <span className="pd-stars">★★★★★</span>
              <span className="pd-rating-text">4.8 (128 reviews)</span>
            </div>
            <div className="pd-price-section">
              <span className="pd-price">₹{parseFloat(product.price).toLocaleString("en-IN")}</span>
              <span className="pd-mrp">MRP: ₹{Math.round(parseFloat(product.price) * 1.15).toLocaleString("en-IN")}</span>
              <span className="pd-discount">15% off</span>
            </div>
            <div className={`pd-stock ${product.stock_qty > 0 ? "in-stock" : "out-of-stock"}`}>
              {product.stock_qty > 0 ? `✅ In Stock (${product.stock_qty} available)` : "❌ Out of Stock"}
            </div>
            {product.warranty && <p className="pd-warranty">🛡️ {product.warranty} Warranty</p>}
            <div className="pd-delivery-info">
              <p>🚚 Free Delivery in Morappur & Dharmapuri</p>
              <p>🔧 Professional Installation Available</p>
              <p>🔄 7-Day Easy Return</p>
            </div>
            <div className="pd-actions">
              <motion.button className="btn btn-primary btn-lg" onClick={addToCart} disabled={product.stock_qty <= 0 || added} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
                {added ? "✓ Added to Cart" : "🛒 Add to Cart"}
              </motion.button>
              <motion.button className="btn btn-secondary btn-lg" onClick={() => navigate(`/register?redirect=checkout&product=${id}`)} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
                💳 Buy Now
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Specifications */}
        <motion.section className="pd-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2>Technical Specifications</h2>
          <div className="pd-specs-grid">
            {Object.entries(specs).map(([key, val]) => (
              <div key={key} className="pd-spec-item"><span className="pd-spec-label">{specLabels[key] || key}</span><span className="pd-spec-value">{val}</span></div>
            ))}
            <div className="pd-spec-item"><span className="pd-spec-label">Brand</span><span className="pd-spec-value">{product.brand}</span></div>
            <div className="pd-spec-item"><span className="pd-spec-label">Category</span><span className="pd-spec-value">{product.category}</span></div>
            {product.warranty && <div className="pd-spec-item"><span className="pd-spec-label">Warranty</span><span className="pd-spec-value">{product.warranty}</span></div>}
          </div>
        </motion.section>

        {/* Features */}
        {product.features && (
          <motion.section className="pd-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2>Key Features</h2>
            <div className="pd-features-grid">
              {product.features.split(",").map((f, i) => (
                <motion.div key={i} className="pd-feature-card" whileHover={{ y: -4 }}><span className="pd-feature-icon">✓</span><span>{f.trim()}</span></motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Customer Reviews */}
        <motion.section className="pd-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2>Customer Reviews</h2>
          <div className="pd-reviews-summary">
            <div className="pd-review-avg"><span className="pd-review-big">4.8</span><span className="pd-stars">★★★★★</span><span className="pd-review-count">128 reviews</span></div>
            <div className="pd-review-bars">{[5,4,3,2,1].map(n=>{const p=[68,22,7,2,1][5-n];return(<div key={n} className="pd-review-bar-row"><span>{n}★</span><div className="pd-review-bar-track"><div className="pd-review-bar-fill" style={{width:`${p}%`}}/></div><span>{p}%</span></div>)})}</div>
          </div>
          <div className="pd-reviews-list">
            {demoReviews.map((r, i) => (
              <motion.div key={i} className="pd-review-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="pd-review-header">
                  <div className="pd-review-avatar">{r.name.charAt(0)}</div>
                  <div>
                    <p className="pd-review-name">{r.name}</p>
                    <p className="pd-review-date">{new Date(r.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <span className="pd-review-badge">{r.badge}</span>
                </div>
                <div className="pd-stars" style={{ fontSize: "0.85rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <p className="pd-review-text">{r.comment}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div className="pd-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxOpen(false)}>
            <motion.img src={images[activeImage]} alt={product.name} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()} />
            <button className="pd-lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
