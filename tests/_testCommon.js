"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { createToken } = require("../tokens/tokens");

let u1Token;

async function commonBeforeAll() {
  await db.query("TRUNCATE packing_items, trip_activities, trip_dates, trips, users RESTART IDENTITY CASCADE");

  await db.query(
    `INSERT INTO users (id, username, password, first_name, last_name, email)
     VALUES 
       (1, 'testuser', $1, 'Test', 'User', 'test@example.com'),
       (2, 'seconduser', $2, 'Second', 'User', 'second@example.com')`,
    [
      await bcrypt.hash("password123", BCRYPT_WORK_FACTOR), 
      await bcrypt.hash("password123", BCRYPT_WORK_FACTOR),
    ]
  );

  await db.query(`
    INSERT INTO trips (id, user_id, location, start_date, end_date)
    VALUES 
      (1, 1, 'San Francisco', '2024-11-05', '2024-11-07'),
      (2, 1, 'Berlin', '2024-12-01', '2024-12-05')`);

  await db.query(`
    INSERT INTO trip_dates (id, trip_id, date, tempmax, tempmin, precipprob)
    VALUES
      (1, 1, '2024-11-05', 65.0, 50.8, 2.0),
      (2, 1, '2024-11-06', 68.0, 52.1, 15.0),
      (3, 1, '2024-11-07', 63.5, 48.5, 25.0)`);

  await db.query(`
    INSERT INTO trip_activities (id, trip_id, date, description)
    VALUES
      (1, 1, '2024-11-05', 'Visit Golden Gate Bridge'),
      (2, 1, '2024-11-06', 'Explore Fisherman''s Wharf'),
      (3, 1, '2024-11-07', 'Tour Alcatraz Island')`);

  await db.query(`
    INSERT INTO packing_items (id, trip_id, item_name)
    VALUES
      (1, 1, 'Raincoat'),
      (2, 1, 'Sunscreen')`);

  // Create tokens after user creation
  u1Token = createToken({ id: 1, username: "testuser" });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
};
