"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { createToken } = require("../tokens/tokens");

async function commonBeforeAll() {
  await db.query("TRUNCATE packing_items, trip_activities, trip_dates, trips, users RESTART IDENTITY CASCADE");

  await db.query(
    `INSERT INTO users (username, password, first_name, last_name, email)
     VALUES ('routeuser1', $1, 'Route', 'User1', 'routeuser1@example.com')`,
    [await bcrypt.hash("password1", BCRYPT_WORK_FACTOR)]
  );

  await db.query(`
    INSERT INTO trips (user_id, location, start_date, end_date)
    VALUES (1, 'San Francisco', '2024-12-01', '2024-12-05')`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  
}

const u1Token = createToken({ id: 1, username: "routeuser1" });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
};
