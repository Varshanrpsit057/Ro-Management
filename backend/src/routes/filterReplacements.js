const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/systems/:sysId/filter-replacements
router.get("/systems/:sysId/filter-replacements", async (req, res) => {
  try {
    const { sysId } = req.params;
    const result = await pool.query(
      "SELECT * FROM filter_replacements WHERE ro_system_id = $1 ORDER BY replaced_date DESC",
      [sysId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch filter replacements" });
  }
});

// POST /api/systems/:sysId/filter-replacements
// next_due_date defaults to replaced_date + 6 months if not provided
router.post("/systems/:sysId/filter-replacements", async (req, res) => {
  try {
    const { sysId } = req.params;
    const { filter_type, replaced_date, next_due_date, cost, notes } = req.body;

    if (!filter_type || !replaced_date) {
      return res.status(400).json({ error: "Filter type and replaced date are required" });
    }

    let dueDate = next_due_date;
    if (!dueDate) {
      // Pure month arithmetic — no Date object, no timezone issues
      const [y, mm, dd] = replaced_date.split("-").map(Number);
      const total = y * 12 + (mm - 1) + 6;
      const ny = Math.floor(total / 12);
      const nm = (total % 12) + 1;
      dueDate = `${ny}-${String(nm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    }

    const result = await pool.query(
      "INSERT INTO filter_replacements (ro_system_id, filter_type, replaced_date, next_due_date, cost, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [sysId, filter_type, replaced_date, dueDate, cost || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create filter replacement" });
  }
});

// DELETE /api/filter-replacements/:id
router.delete("/filter-replacements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM filter_replacements WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Filter replacement not found" });
    }
    res.json({ message: "Filter replacement deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete filter replacement" });
  }
});

module.exports = router;
