"use strict";

/** Database setup */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

const db = new Client({
  connectionString: getDatabaseUri(),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

db.connect() // Automatically connect when this file is imported
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Database connection error:", err.stack));

module.exports = db;
