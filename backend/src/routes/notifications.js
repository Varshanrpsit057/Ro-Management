const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/notifications
router.get("/", async (req, res) => {
  try {
    const [upcomingRes, overdueRes] = await Promise.all([
      pool.query(
        `SELECT fr.*, rs.model_name, c.name AS customer_name, c.phone AS customer_phone
         FROM filter_replacements fr
         JOIN ro_systems rs ON fr.ro_system_id = rs.id
         JOIN customers c ON rs.customer_id = c.id
         WHERE fr.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
         ORDER BY fr.next_due_date ASC`
      ),
      pool.query(
        `SELECT fr.*, rs.model_name, c.name AS customer_name, c.phone AS customer_phone
         FROM filter_replacements fr
         JOIN ro_systems rs ON fr.ro_system_id = rs.id
         JOIN customers c ON rs.customer_id = c.id
         WHERE fr.next_due_date < CURRENT_DATE
         ORDER BY fr.next_due_date ASC`
      ),
    ]);

    res.json({
      upcoming: upcomingRes.rows,
      overdue: overdueRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

module.exports = router;
