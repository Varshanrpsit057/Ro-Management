const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const [custRes, sysRes, prodRes, upcomingRes, overdueRes] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM customers"),
      pool.query("SELECT COUNT(*)::int AS count FROM ro_systems WHERE status = 'active'"),
      pool.query("SELECT COUNT(*)::int AS count FROM products WHERE stock_qty > 0"),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM filter_replacements
         WHERE next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM filter_replacements
         WHERE next_due_date < CURRENT_DATE`
      ),
    ]);

    res.json({
      totalCustomers: custRes.rows[0].count,
      totalROSystems: sysRes.rows[0].count,
      availableProducts: prodRes.rows[0].count,
      upcomingReplacements: upcomingRes.rows[0].count,
      overdueReplacements: overdueRes.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;
