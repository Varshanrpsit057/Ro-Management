import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LazyImage from "./LazyImage";
import { motion } from "framer-motion";

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
      if (name.includes("marvel")) return "/images/ro-systems/aquaguard-marvel.jpg.jpeg";
      if (name.includes("aura")) return "/images/ro-systems/aquaguard-aura.jpg.jpeg";
      if (name.includes("aston")) return "/images/ro-systems/aquaguard-aston.jpg.jpeg";
      return "/images/ro-systems/aquaguard-marvel.jpg.jpeg";
    }
    if (brand.includes("kent")) {
      if (name.includes("grand") || name.includes("plus")) return "/images/ro-systems/kent-grand-plus.jpg.jpeg";
      if (name.includes("pride")) return "/images/ro-systems/kent-pride.jpg.jpeg";
      if (name.includes("supreme")) return "/images/ro-systems/kent-supreme.jpg.jpeg";
      return "/images/ro-systems/kent-grand-plus.jpg.jpeg";
    }
    if (brand.includes("livpure")) {
      if (name.includes("glo")) return "/images/ro-systems/livpure-glo.jpg.jpeg";
      if (name.includes("touch")) return "/images/ro-systems/livpure-touch.jpg.jpeg";
      return "/images/ro-systems/livpure-glo.jpg.jpeg";
    }
    if (brand.includes("pureit")) {
      if (name.includes("copper")) return "/images/ro-systems/pureit-copper.jpg.jpeg";
      return "/images/ro-systems/pureit-advanced.jpg.jpeg";
    }
    if (brand.includes("grand aqua") || brand.includes("aqua grand")) {
      if (name.includes("commercial") || name.includes("100lph")) return "/images/ro-systems/grand-aqua-commercial.jpg.jpeg";
      if (name.includes("industrial") || name.includes("500lph")) return "/images/ro-systems/grand-aqua-commercial.jpg.jpeg";
      return "/images/ro-systems/grand-aqua-domestic.jpg.jpeg";
    }
    if (brand.includes("elpron")) {
      if (name.includes("commercial") || name.includes("deluxe")) return "/images/ro-systems/elpron-commercial.jpg.jpeg";
      return "/images/ro-systems/elpron-domestic.jpg.jpeg";
    }
    if (brand.includes("aqua platinum")) return "/images/ro-systems/Aqua-Platinum-RO-Water-Purifier.jpg.jpeg";
    return "/images/ro-systems/kent-grand-plus.jpg.jpeg";
  }

  // ─── Filters ───
  if (cat === "Filters" || name.includes("filter") || name.includes("sediment") || name.includes("carbon")) {
    if (name.includes("pp") || name.includes("sediment")) return "/images/filters/PP filter.png";
    if (name.includes("carbon") && !name.includes("post")) return "/images/filters/ro carborn filter.jpg.jpeg";
    if (name.includes("post carbon") || name.includes("t33") || name.includes("taste")) return "/images/filters/T33 filter.jpg.jpeg";
    if (name.includes("inline") || name.includes("purifier inline")) return "/images/filters/purifier inline.jpg.jpeg";
    return "/images/filters/PP filter.png";
  }

  // ─── Membranes ───
  if (cat === "Membranes" || name.includes("membrane")) {
    if (name.includes("uf") || name.includes("ultrafiltration")) return "/images/filters/UF membrane.jpg.jpeg";
    if (name.includes("eco") || name.includes("75 gpd")) return "/images/filters/membrane eco 75 gpd.jpg.jpeg";
    return "/images/filters/2012-100-2012-100-Gpd-RO-Membrane-100gpd.avif";
  }

  // ─── Pumps ───
  if (cat === "Pumps" || name.includes("pump") || name.includes("booster")) {
    if (name.includes("24v") || name.includes("dc")) return "/images/pumps/24v-booster-pump.jpg.jpeg";
    if (name.includes("diaphragm")) return "/images/pumps/diaphragm-pump.jpg.jpeg";
    if (name.includes("high pressure") || name.includes("100psi")) return "/images/pumps/high-pressure-pump.jpg.jpeg";
    if (name.includes("motor")) return "/images/pumps/ro-motor.jpg.jpeg";
    return "/images/pumps/booster-pump.jpg.jpeg";
  }

  // ─── Fittings / Components ───
  if (name.includes("smps") || name.includes("adapter")) {
    if (name.includes("24v")) return "/images/fittings/24v-adapter.jpg.jpeg";
    return "/images/fittings/smps-adapter.jpg.jpeg";
  }
  if (name.includes("solenoid") || name.includes("valve")) return "/images/fittings/solenoid-valve.jpg.jpeg";
  if (name.includes("float switch")) return "/images/fittings/float-switch.jpg.jpeg";
  if (name.includes("flow restrictor")) return "/images/fittings/flow-restrictor.jpg.jpeg";
  if (name.includes("flush valve")) return "/images/fittings/flush-valve.jpg.jpeg";
  if (name.includes("high pressure switch")) return "/images/fittings/high-pressure-switch.jpg.jpeg";
  if (name.includes("low pressure switch")) return "/images/fittings/low-pressure-switch.jpg.jpeg";

  // ─── Batteries ───
  if (cat === "Tubular Batteries" || cat === "Flat Plate Batteries" || cat === "SMF Batteries" || name.includes("battery")) {
    if (brand.includes("powerzone") || brand.includes("power zone")) return "/images/batteries/powerzone-battery.jpg.jpeg";
    if (brand.includes("exide")) return "/images/batteries/exide-battery.jpg.jpeg";
    if (brand.includes("luminous")) return "/images/batteries/luminous-battery.jpg.jpeg";
    if (brand.includes("amaron")) return "/images/batteries/inverter-battery.jpg.jpeg";
    if (name.includes("smf")) return "/images/batteries/smf-battery.jpg.jpeg";
    if (name.includes("tubular")) return "/images/batteries/tubular-battery .jpg.jpeg";
    if (name.includes("cable")) return "/images/batteries/battery-cable.jpg.jpeg";
    if (name.includes("terminal")) return "/images/batteries/battery-terminal.jpg.jpeg";
    return "/images/batteries/powerzone-battery.jpg.jpeg";
  }

  // ─── UPS ───
  if (cat === "Home UPS" || cat === "Office UPS" || cat === "Inverters" || name.includes("ups") || name.includes("inverter")) {
    return "/images/ups.svg";
  }

  // ─── Chargers ───
  if (name.includes("charger")) return "/images/batteries/battery-terminal.jpg.jpeg";

  // ─── Fallback SVGs ───
  if (name.includes("housing") || name.includes("clamp") || name.includes("bracket")) return "/images/housing.svg";
  if (name.includes("faucet") || name.includes("tap")) return "/images/faucet.svg";
  if (name.includes("tank") || name.includes("storage")) return "/images/tank.svg";
  if (name.includes("connector") || name.includes("elbow") || name.includes("tee") || name.includes("pipe") || name.includes("tubing") || name.includes("o ring")) return "/images/connector.svg";
  if (name.includes("kit") || name.includes("service")) return "/images/kit.svg";
  if (name.includes("uv") || name.includes("lamp")) return "/images/uv-lamp.svg";
  if (name.includes("stabilizer")) return "/images/component.svg";

  return "/images/ro-system.svg";
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
