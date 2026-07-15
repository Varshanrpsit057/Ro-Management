const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/customers?search=
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM customers";
    const params = [];

    if (search) {
      query += " WHERE name ILIKE $1 OR phone ILIKE $1";
      params.push(`%${search}%`);
    }
    query += " ORDER BY id DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET /api/customers/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// POST /api/customers
router.post("/", async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }
    const result = await pool.query(
      "INSERT INTO customers (name, phone, address) VALUES ($1, $2, $3) RETURNING *",
      [name, phone, address || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Phone number already exists" });
    }
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// PUT /api/customers/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }
    const result = await pool.query(
      "UPDATE customers SET name = $1, phone = $2, address = $3, updated_at = NOW() WHERE id = $4 RETURNING *",
      [name, phone, address || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Phone number already exists" });
    }
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM customers WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
