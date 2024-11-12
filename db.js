"use strict";

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri(),
  });
}

// Only connect if not running in test environment.
if (process.env.NODE_ENV !== "test") {
  db.connect()
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Database connection error:", err.stack));
}

module.exports = db;
