import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LazyImage from "./LazyImage";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL; // "/acs-varshan/"

/**
 * Maps a product name/brand to a real local image if one exists.
 * Falls back to category SVG icons if no photo match.
 */
function getImagePath(product) {
  const cat = product.category || "";
  const name = (product.name || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  const model = (product.model || "").toLowerCase();

  // ─── RO Systems ───
  if (cat === "Complete RO Systems" || name.includes("purifier") || name.includes("commercial ro") || name.includes("industrial ro")) {
    if (brand.includes("aquaguard") || model.includes("aquaguard")) {
      if (name.includes("marvel")) return `${BASE}images/ro-systems/aquaguard-marvel.jpg`;
      if (name.includes("aura")) return `${BASE}images/ro-systems/aquaguard-aura.jpg`;
      if (name.includes("aston")) return `${BASE}images/ro-systems/aquaguard-aston.jpg`;
      return `${BASE}images/ro-systems/aquaguard-marvel.jpg`;
    }
    if (brand.includes("kent")) {
      if (name.includes("grand") || name.includes("plus")) return `${BASE}images/ro-systems/kent-grand-plus.jpg`;
      if (name.includes("pride")) return `${BASE}images/ro-systems/kent-pride.jpg`;
      if (name.includes("supreme")) return `${BASE}images/ro-systems/kent-supreme.jpg`;
      return `${BASE}images/ro-systems/kent-grand-plus.jpg`;
    }
    if (brand.includes("livpure")) {
      if (name.includes("glo")) return `${BASE}images/ro-systems/livpure-glo.jpg`;
      if (name.includes("touch")) return `${BASE}images/ro-systems/livpure-touch.jpg`;
      return `${BASE}images/ro-systems/livpure-glo.jpg`;
    }
    if (brand.includes("pureit")) {
      if (name.includes("copper")) return `${BASE}images/ro-systems/pureit-copper.jpg`;
      return `${BASE}images/ro-systems/pureit-advanced.jpg`;
    }
    if (brand.includes("grand aqua") || brand.includes("aqua grand")) {
      if (name.includes("commercial") || name.includes("100lph")) return `${BASE}images/ro-systems/grand-aqua-commercial.jpg`;
      if (name.includes("industrial") || name.includes("500lph")) return `${BASE}images/ro-systems/grand-aqua-commercial.jpg`;
      return `${BASE}images/ro-systems/grand-aqua-domestic.jpg`;
    }
    if (brand.includes("elpron")) {
      if (name.includes("commercial") || name.includes("deluxe")) return `${BASE}images/ro-systems/elpron-commercial.jpg`;
      return `${BASE}images/ro-systems/elpron-domestic.jpg`;
    }
    if (brand.includes("aqua platinum")) return `${BASE}images/ro-systems/Aqua-Platinum-RO-Water-Purifier.jpg`;
    return `${BASE}images/ro-systems/kent-grand-plus.jpg`;
  }

  // ─── Filters ───
  if (cat === "Filters" || name.includes("filter") || name.includes("sediment") || name.includes("carbon")) {
    if (name.includes("pp") || name.includes("sediment")) return `${BASE}images/filters/PP filter.png`;
    if (name.includes("carbon") && !name.includes("post")) return `${BASE}images/filters/ro carborn filter.jpg`;
    if (name.includes("post carbon") || name.includes("t33") || name.includes("taste")) return `${BASE}images/filters/T33 filter.jpg`;
    if (name.includes("inline") || name.includes("purifier inline")) return `${BASE}images/filters/purifier inline.jpg`;
    return `${BASE}images/filters/PP filter.png`;
  }

  // ─── Membranes ───
  if (cat === "Membranes" || name.includes("membrane")) {
    if (name.includes("uf") || name.includes("ultrafiltration")) return `${BASE}images/filters/UF membrane.jpg`;
    if (name.includes("eco") || name.includes("75 gpd")) return `${BASE}images/filters/membrane eco 75 gpd.jpg`;
    return `${BASE}images/filters/2012-100-2012-100-Gpd-RO-Membrane-100gpd.avif`;
  }

  // ─── Pumps ───
  if (cat === "Pumps" || name.includes("pump") || name.includes("booster")) {
    if (name.includes("24v") || name.includes("dc")) return `${BASE}images/pumps/24v-booster-pump.jpg`;
    if (name.includes("diaphragm")) return `${BASE}images/pumps/diaphragm-pump.jpg`;
    if (name.includes("high pressure") || name.includes("100psi")) return `${BASE}images/pumps/high-pressure-pump.jpg`;
    if (name.includes("motor")) return `${BASE}images/pumps/ro-motor.jpg`;
    return `${BASE}images/pumps/booster-pump.jpg`;
  }

  // ─── Fittings / Components ───
  if (name.includes("smps") || name.includes("adapter")) {
    if (name.includes("24v")) return `${BASE}images/fittings/24v-adapter.jpg`;
    return `${BASE}images/fittings/smps-adapter.jpg`;
  }
  if (name.includes("solenoid") || name.includes("valve")) return `${BASE}images/fittings/solenoid-valve.jpg`;
  if (name.includes("float switch")) return `${BASE}images/fittings/float-switch.jpg`;
  if (name.includes("flow restrictor")) return `${BASE}images/fittings/flow-restrictor.jpg`;
  if (name.includes("flush valve")) return `${BASE}images/fittings/flush-valve.jpg`;
  if (name.includes("high pressure switch")) return `${BASE}images/fittings/high-pressure-switch.jpg`;
  if (name.includes("low pressure switch")) return `${BASE}images/fittings/low-pressure-switch.jpg`;

  // ─── Batteries ───
  if (cat === "Tubular Batteries" || cat === "Flat Plate Batteries" || cat === "SMF Batteries" || name.includes("battery")) {
    if (brand.includes("powerzone") || brand.includes("power zone")) return `${BASE}images/batteries/powerzone-battery.jpg`;
    if (brand.includes("exide")) return `${BASE}images/batteries/exide-battery.jpg`;
    if (brand.includes("luminous")) return `${BASE}images/batteries/luminous-battery.jpg`;
    if (brand.includes("amaron")) return `${BASE}images/batteries/inverter-battery.jpg`;
    if (name.includes("smf")) return `${BASE}images/batteries/smf-battery.jpg`;
    if (name.includes("tubular")) return `${BASE}images/batteries/tubular-battery.jpg`;
    if (name.includes("cable")) return `${BASE}images/batteries/battery-cable.jpg`;
    if (name.includes("terminal")) return `${BASE}images/batteries/battery-terminal.jpg`;
    return `${BASE}images/batteries/powerzone-battery.jpg`;
  }

  // ─── UPS ───
  if (cat === "Home UPS" || cat === "Office UPS" || cat === "Inverters" || name.includes("ups") || name.includes("inverter")) {
    return `${BASE}images/ups.svg`;
  }

  // ─── Chargers ───
  if (name.includes("charger")) return `${BASE}images/batteries/battery-terminal.jpg`;

  // ─── Fallback SVGs ───
  if (name.includes("housing") || name.includes("clamp") || name.includes("bracket")) return `${BASE}images/housing.svg`;
  if (name.includes("faucet") || name.includes("tap")) return `${BASE}images/faucet.svg`;
  if (name.includes("tank") || name.includes("storage")) return `${BASE}images/tank.svg`;
  if (name.includes("connector") || name.includes("elbow") || name.includes("tee") || name.includes("pipe") || name.includes("tubing") || name.includes("o ring")) return `${BASE}images/connector.svg`;
  if (name.includes("kit") || name.includes("service")) return `${BASE}images/kit.svg`;
  if (name.includes("uv") || name.includes("lamp")) return `${BASE}images/uv-lamp.svg`;
  if (name.includes("stabilizer")) return `${BASE}images/component.svg`;

  return `${BASE}images/ro-system.svg`;
}

export default function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const imgSrc = getImagePath(product);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!onAddToCart || product.stock_qty <= 0) return;
    setAdded(true);
    onAddToCart(product);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      className="store-product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="product-image-wrap">
        <LazyImage
          src={imgSrc}
          alt={product.name}
          containerClassName="product-lazy-wrap"
          className="store-product-lazy-img"
          objectFit="cover"
          fallbackSrc={`${BASE}images/ro-system.svg`}
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
          >
            {added ? "✓ Added" : "🛒 Add to Cart"}
          </motion.button>
          <button className="btn btn-secondary" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>
    </motion.div>
  );
}
