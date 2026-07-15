const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/customers/:custId/systems
router.get("/customers/:custId/systems", async (req, res) => {
  try {
    const { custId } = req.params;
    const result = await pool.query(
      "SELECT * FROM ro_systems WHERE customer_id = $1 ORDER BY id DESC",
      [custId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch systems" });
  }
});

// GET /api/systems/:id
router.get("/systems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM ro_systems WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "RO system not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch system" });
  }
});

// POST /api/customers/:custId/systems
router.post("/customers/:custId/systems", async (req, res) => {
  try {
    const { custId } = req.params;
    const { model_name, install_date, status, notes } = req.body;
    if (!model_name) {
      return res.status(400).json({ error: "Model name is required" });
    }
    const result = await pool.query(
      "INSERT INTO ro_systems (customer_id, model_name, install_date, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [custId, model_name, install_date || null, status || "active", notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create system" });
  }
});

// PUT /api/systems/:id
router.put("/systems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { model_name, install_date, status, notes } = req.body;
    if (!model_name) {
      return res.status(400).json({ error: "Model name is required" });
    }
    const result = await pool.query(
      "UPDATE ro_systems SET model_name = $1, install_date = $2, status = $3, notes = $4, updated_at = NOW() WHERE id = $5 RETURNING *",
      [model_name, install_date || null, status || "active", notes || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "RO system not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update system" });
  }
});

// DELETE /api/systems/:id
router.delete("/systems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM ro_systems WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "RO system not found" });
    }
    res.json({ message: "RO system deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete system" });
  }
});

module.exports = router;
