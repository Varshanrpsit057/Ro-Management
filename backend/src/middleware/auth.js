// Simple session-token auth middleware
// Client sends token in Authorization header; server looks it up in the sessions table
const pool = require("../db");

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const result = await pool.query(
      "SELECT user_id FROM sessions WHERE token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    req.user_id = result.rows[0].user_id;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
}

module.exports = authMiddleware;
