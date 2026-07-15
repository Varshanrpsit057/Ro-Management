const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/systems/:sysId/service-history
router.get("/systems/:sysId/service-history", async (req, res) => {
  try {
    const { sysId } = req.params;
    const result = await pool.query(
      "SELECT * FROM service_history WHERE ro_system_id = $1 ORDER BY service_date DESC",
      [sysId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch service history" });
  }
});

// POST /api/systems/:sysId/service-history
router.post("/systems/:sysId/service-history", async (req, res) => {
  try {
    const { sysId } = req.params;
    const { service_date, description, cost } = req.body;

    if (!service_date || !description) {
      return res.status(400).json({ error: "Service date and description are required" });
    }

    const result = await pool.query(
      "INSERT INTO service_history (ro_system_id, service_date, description, cost) VALUES ($1, $2, $3, $4) RETURNING *",
      [sysId, service_date, description, cost || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create service record" });
  }
});

module.exports = router;
