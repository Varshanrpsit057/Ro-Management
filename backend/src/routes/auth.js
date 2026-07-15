const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

// Simple session tokens table (in-memory fallback + DB)
const CREATE_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS sessions (
    token    VARCHAR(64) PRIMARY KEY,
    user_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

// Ensure sessions table exists at startup
pool.query(CREATE_SESSIONS_TABLE).catch(() => {});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, full_name } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password, full_name) VALUES ($1, $2, $3) RETURNING id, username, full_name, created_at",
      [username, hash, full_name || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username already taken" });
    }
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate simple session token
    const token = crypto.randomBytes(32).toString("hex");
    await pool.query("INSERT INTO sessions (token, user_id) VALUES ($1, $2)", [token, user.id]);

    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
});

// GET /api/auth/me — returns current user from token
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const result = await pool.query(
      "SELECT u.id, u.username, u.full_name FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.token = $1",
      [token]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid session" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

module.exports = router;
