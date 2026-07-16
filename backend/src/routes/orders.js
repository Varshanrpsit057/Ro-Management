const express = require("express");
const pool = require("../db");

const router = express.Router();

// POST /api/store/orders — place an order (public)
router.post("/orders", async (req, res) => {
  try {
    const { session_id, customer_name, customer_phone, customer_address, payment_method, items, notes } = req.body;
    if (!customer_name || !customer_phone || !customer_address || !items || !items.length) {
      return res.status(400).json({ error: "Name, phone, address, and items required" });
    }

    const total = items.reduce((s, i) => s + parseFloat(i.price) * parseInt(i.qty), 0);

    const order = await pool.query(
      `INSERT INTO store_orders (session_id, customer_name, customer_phone, customer_address, payment_method, total_amount, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [session_id || "", customer_name, customer_phone, customer_address, payment_method || "cod", total, notes || null]
    );

    for (const item of items) {
      await pool.query(
        "INSERT INTO store_order_items (order_id, product_id, product_name, price, qty) VALUES ($1,$2,$3,$4,$5)",
        [order.rows[0].id, item.product_id, item.product_name, item.price, item.qty]
      );
    }

    // Clear cart
    if (session_id) await pool.query("DELETE FROM store_cart WHERE session_id = $1", [session_id]);

    res.status(201).json(order.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// GET /api/store/orders/:id — track order (public)
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await pool.query("SELECT * FROM store_orders WHERE id = $1", [req.params.id]);
    if (!order.rows.length) return res.status(404).json({ error: "Order not found" });
    const items = await pool.query("SELECT * FROM store_order_items WHERE order_id = $1", [req.params.id]);
    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// ─── Admin routes (auth required) ───
const authMiddleware = require("../middleware/auth");

// GET /api/admin/orders — list all orders
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM store_orders ORDER BY created_at DESC");
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT /api/admin/orders/:id — update status
router.put("/orders/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const r = await pool.query(
      "UPDATE store_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ─── Service Bookings (public) ───
router.post("/bookings", async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_address, service_type, preferred_date, description } = req.body;
    if (!customer_name || !customer_phone || !customer_address || !service_type) {
      return res.status(400).json({ error: "Name, phone, address, and service type required" });
    }
    const r = await pool.query(
      `INSERT INTO service_bookings (customer_name, customer_phone, customer_address, service_type, preferred_date, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [customer_name, customer_phone, customer_address, service_type, preferred_date || null, description || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// ─── Admin — Service Bookings ───
router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM service_bookings ORDER BY created_at DESC");
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.put("/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const { status, technician, admin_notes } = req.body;
    const r = await pool.query(
      "UPDATE service_bookings SET status = COALESCE($1,status), technician = COALESCE($2,technician), admin_notes = COALESCE($3,admin_notes), updated_at = NOW() WHERE id = $4 RETURNING *",
      [status, technician, admin_notes, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

module.exports = router;
