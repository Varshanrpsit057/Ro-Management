const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

// --------------- Products (public) ---------------

// GET /api/store/products?store_type=ro|ups&category=&search=&featured=
router.get("/products", async (req, res) => {
  try {
    const { store_type, category, search, featured } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (store_type) {
      conditions.push(`store_type = $${idx++}`);
      params.push(store_type);
    }
    if (category) {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx} OR brand ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (featured === "true") {
      conditions.push("is_featured = true");
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT * FROM store_products ${where} ORDER BY is_featured DESC, id`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/store/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [product, reviews] = await Promise.all([
      pool.query("SELECT * FROM store_products WHERE id = $1", [id]),
      pool.query("SELECT * FROM store_reviews WHERE product_id = $1 ORDER BY created_at DESC", [id]),
    ]);
    if (product.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ ...product.rows[0], reviews: reviews.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// GET /api/store/categories?store_type=ro|ups
router.get("/categories", async (req, res) => {
  try {
    const { store_type } = req.query;
    const result = await pool.query(
      "SELECT DISTINCT category FROM store_products WHERE store_type = $1 ORDER BY category",
      [store_type || "ro"]
    );
    res.json(result.rows.map((r) => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// --------------- Cart (session-based) ---------------

// GET /api/store/cart?session_id=xxx
router.get("/cart", async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "session_id required" });

    const result = await pool.query(
      `SELECT sc.id, sc.qty, sp.*
       FROM store_cart sc JOIN store_products sp ON sc.product_id = sp.id
       WHERE sc.session_id = $1 ORDER BY sc.id`,
      [session_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// POST /api/store/cart
router.post("/cart", async (req, res) => {
  try {
    const { session_id, product_id, qty } = req.body;
    if (!session_id || !product_id) return res.status(400).json({ error: "session_id and product_id required" });

    // Check if item already in cart
    const existing = await pool.query(
      "SELECT * FROM store_cart WHERE session_id = $1 AND product_id = $2",
      [session_id, product_id]
    );

    if (existing.rows.length > 0) {
      const updated = await pool.query(
        "UPDATE store_cart SET qty = qty + $1 WHERE id = $2 RETURNING *",
        [qty || 1, existing.rows[0].id]
      );
      return res.json(updated.rows[0]);
    }

    const result = await pool.query(
      "INSERT INTO store_cart (session_id, product_id, qty) VALUES ($1, $2, $3) RETURNING *",
      [session_id, product_id, qty || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// PUT /api/store/cart/:id
router.put("/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;
    if (qty <= 0) {
      await pool.query("DELETE FROM store_cart WHERE id = $1", [id]);
      return res.json({ message: "Removed" });
    }
    const result = await pool.query("UPDATE store_cart SET qty = $1 WHERE id = $2 RETURNING *", [qty, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// DELETE /api/store/cart/:id
router.delete("/cart/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM store_cart WHERE id = $1", [req.params.id]);
    res.json({ message: "Removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// --------------- Reviews ---------------

// POST /api/store/reviews
router.post("/reviews", async (req, res) => {
  try {
    const { product_id, author, rating, comment } = req.body;
    if (!product_id || !rating) return res.status(400).json({ error: "product_id and rating required" });

    const result = await pool.query(
      "INSERT INTO store_reviews (product_id, author, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [product_id, author || "Anonymous", rating, comment || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add review" });
  }
});

module.exports = router;
