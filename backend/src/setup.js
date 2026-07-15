// One-time setup: create database, run schema, seed data
require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function run() {
  // Connect to default 'postgres' database first to create our DB
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: "postgres",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  try {
    await adminClient.connect();

    // Check if DB exists
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (dbCheck.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database '${process.env.DB_NAME}' created.`);
    } else {
      console.log(`Database '${process.env.DB_NAME}' already exists.`);
    }

    await adminClient.end();

    // Connect to our DB and run schema + seed
    const dbClient = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    await dbClient.connect();

    const schemaSQL = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );
    await dbClient.query(schemaSQL);
    console.log("Schema applied successfully.");

    const seedSQL = fs.readFileSync(
      path.join(__dirname, "..", "seed.sql"),
      "utf8"
    );
    await dbClient.query(seedSQL);
    console.log("Seed data inserted successfully.");

    // Verify tables
    const tables = await dbClient.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log(
      "\nTables in database:",
      tables.rows.map((r) => r.table_name).join(", ")
    );

    await dbClient.end();
    console.log("\nDatabase setup complete!");
  } catch (err) {
    console.error("Setup failed:", err.message);
    process.exit(1);
  }
}

run();
