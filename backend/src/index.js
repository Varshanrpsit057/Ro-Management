require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const customersRouter = require("./routes/customers");
const roSystemsRouter = require("./routes/roSystems");
const productsRouter = require("./routes/products");
const filterReplacementsRouter = require("./routes/filterReplacements");
const serviceHistoryRouter = require("./routes/serviceHistory");
const dashboardRouter = require("./routes/dashboard");
const notificationsRouter = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- Public routes (no auth) ---------------
app.use("/api/auth", authRouter);

// --------------- Protected routes (auth required) ---------------
app.use("/api/dashboard", authMiddleware, dashboardRouter);
app.use("/api/customers", authMiddleware, customersRouter);
app.use("/api", authMiddleware, roSystemsRouter);
app.use("/api", authMiddleware, filterReplacementsRouter);
app.use("/api", authMiddleware, serviceHistoryRouter);
app.use("/api/products", authMiddleware, productsRouter);
app.use("/api/notifications", authMiddleware, notificationsRouter);

// --------------- Health check ---------------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --------------- 404 catch-all ---------------
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --------------- Error handler ---------------
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// --------------- Start ---------------
app.listen(PORT, () => {
  console.log(`RO Service API running on http://localhost:${PORT}`);
});
