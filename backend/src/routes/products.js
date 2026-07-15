const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/products?search=
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM products";
    const params = [];

    if (search) {
      query += " WHERE name ILIKE $1 OR description ILIKE $1";
      params.push(`%${search}%`);
    }
    query += " ORDER BY id DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const { name, description, price, stock_qty, image_url } = req.body;
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const result = await pool.query(
      "INSERT INTO products (name, description, price, stock_qty, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description || null, price, stock_qty || 0, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_qty, image_url } = req.body;
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const result = await pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, stock_qty = $4, image_url = $5, updated_at = NOW() WHERE id = $6 RETURNING *",
      [name, description || null, price, stock_qty || 0, image_url || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
