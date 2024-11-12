"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // Clean all tables
  await db.query("TRUNCATE packing_items, trip_activities, trip_dates, trips, users RESTART IDENTITY CASCADE");

  // Insert test user and trip
  await db.query(
    `INSERT INTO users (username, password, first_name, last_name, email)
     VALUES ('modeluser', $1, 'Model', 'User', 'modeluser@example.com')`,
    [await bcrypt.hash("password123", BCRYPT_WORK_FACTOR)]
  );

  await db.query(`
    INSERT INTO trips (user_id, location, start_date, end_date)
    VALUES (1, 'New York', '2024-11-20', '2024-11-25')`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
