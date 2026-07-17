import { useState } from "react";
import LazyImage from "./LazyImage";
import { motion } from "framer-motion";

function getImagePath(product) {
  const cat = product.category || "";
  const name = (product.name || "").toLowerCase();
  if (cat === "Complete RO Systems" || name.includes("purifier")) return "/images/ro-system.svg";
  if (cat === "Filters" || name.includes("filter") || name.includes("sediment") || name.includes("carbon") || name.includes("post carbon")) return "/images/filter.svg";
  if (cat === "Membranes" || name.includes("membrane") || name.includes("uf ")) return "/images/membrane.svg";
  if (name.includes("uv") || name.includes("lamp")) return "/images/uv-lamp.svg";
  if (cat === "Pumps" || name.includes("pump") || name.includes("booster")) return "/images/pump.svg";
  if (name.includes("smps") || name.includes("adapter")) return "/images/smps.svg";
  if (name.includes("housing") || name.includes("clamp") || name.includes("bracket")) return "/images/housing.svg";
  if (name.includes("faucet") || name.includes("tap")) return "/images/faucet.svg";
  if (name.includes("tank") || name.includes("storage")) return "/images/tank.svg";
  if (name.includes("connector") || name.includes("elbow") || name.includes("tee") || name.includes("pipe") || name.includes("tubing") || name.includes("fitting") || name.includes("o ring")) return "/images/connector.svg";
  if (name.includes("solenoid") || name.includes("valve") || name.includes("flow restrictor") || name.includes("tds") || name.includes("float switch") || name.includes("pressure switch")) return "/images/component.svg";
  if (name.includes("kit") || name.includes("service") || name.includes("accessor")) return "/images/kit.svg";
  if (cat === "UPS Systems" || cat === "Home UPS" || cat === "Office UPS" || cat === "Inverters" || name.includes("ups") || name.includes("inverter")) return "/images/ups.svg";
  if (cat === "Tubular Batteries" || cat === "Flat Plate Batteries" || cat === "SMF Batteries" || name.includes("battery") || name.includes("charger")) return "/images/battery.svg";
  if (name.includes("stabilizer")) return "/images/component.svg";
  return "/images/ro-system.svg";
}

export default function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const isROSystem = (product.category === "Complete RO Systems" || (product.name || "").toLowerCase().includes("purifier"));
  const imgSrc = getImagePath(product);

  const handleAddToCart = () => {
    if (!onAddToCart || product.stock_qty <= 0) return;
    setAdded(true);
    onAddToCart(product);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      className="store-product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
    >
      <div className="product-image-wrap">
        <LazyImage
          src={imgSrc}
          alt={product.name}
          containerClassName="product-lazy-wrap"
          className="store-product-lazy-img"
          objectFit={isROSystem ? "cover" : "contain"}
          fallbackSrc="/images/ro-system.svg"
        />
        {product.is_featured && <span className="featured-badge">Featured</span>}
      </div>
      <div className="store-product-body">
        <span className={`product-category-tag ${product.store_type === "ups" ? "ups-tag" : ""}`}>
          {product.category}
        </span>
        <h3>{product.name}</h3>
        <p className="product-brand">{product.brand} {product.model && `• ${product.model}`}</p>
        <p className="product-desc-short">{product.description?.substring(0, 100)}{product.description?.length > 100 ? "..." : ""}</p>
        {product.features && (
          <ul className="feature-list">
            {product.features.split(",").slice(0, 3).map((f, i) => (<li key={i}>{f.trim()}</li>))}
          </ul>
        )}
        {product.specs && (
          <div className="specs-pills">
            {product.specs.capacity && <span className="spec-pill">⚡ {product.specs.capacity}</span>}
            {product.specs.wattage && <span className="spec-pill">🔌 {product.specs.wattage}</span>}
            {product.specs.voltage && <span className="spec-pill">🔋 {product.specs.voltage}</span>}
            {product.specs.backup && <span className="spec-pill">⏱️ {product.specs.backup}</span>}
          </div>
        )}
        <div className="product-price-row">
          <span className="store-price">₹{parseFloat(product.price).toLocaleString("en-IN")}</span>
          <span className={`stock-tag ${product.stock_qty > 5 ? "in-stock" : product.stock_qty > 0 ? "low-stock" : "out-of-stock"}`}>
            {product.stock_qty > 5 ? "In Stock" : product.stock_qty > 0 ? `Only ${product.stock_qty} left` : "Out of Stock"}
          </span>
        </div>
        {product.warranty && <p className="warranty-tag">🛡️ {product.warranty}</p>}
        <div className="store-card-actions">
          <motion.button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={product.stock_qty <= 0 || added}
            whileTap={{ scale: 0.95 }}
            animate={added ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            {added ? "✓ Added" : "🛒 Add to Cart"}
          </motion.button>
          <button className="btn btn-secondary">Buy Now</button>
        </div>
      </div>
    </motion.div>
  );
}
