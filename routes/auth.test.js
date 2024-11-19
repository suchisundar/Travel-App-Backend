// routes/auth.test.js

"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../tests/testCommon");

beforeAll(async () => {
  await commonBeforeAll();
  // Add a test user for authentication tests
  const hashedPassword = await bcrypt.hash("password123", BCRYPT_WORK_FACTOR);
  await db.query(
    `INSERT INTO users (username, password, first_name, last_name, email)
     VALUES ('authuser', $1, 'Auth', 'User', 'auth@example.com')`,
    [hashedPassword]
  );
});
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Auth Routes", () => {
  /************************************** POST /auth/token */

  describe("POST /auth/token", () => {
    test("works with valid credentials", async () => {
      const res = await request(app)
        .post("/auth/token")
        .send({ username: "authuser", password: "password123" });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
    });

    test("unauthorized with invalid credentials", async () => {
      const res = await request(app)
        .post("/auth/token")
        .send({ username: "authuser", password: "wrongpassword" });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error.message).toEqual("Invalid username/password");
    });

    test("bad request with missing data", async () => {
      const res = await request(app).post("/auth/token").send({ username: "authuser" });

      expect(res.statusCode).toEqual(400);
    });
  });

  /************************************** POST /auth/register */

  describe("POST /auth/register", () => {
    test("works for new user", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          username: "newuser",
          password: "newpassword",
          firstName: "New",
          lastName: "User",
          email: "newuser@example.com",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("token");
    });

    test("bad request with missing data", async () => {
      const res = await request(app).post("/auth/register").send({
        username: "incompleteuser",
        password: "password",
      });

      expect(res.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async () => {
      const res = await request(app).post("/auth/register").send({
        username: "invalidemailuser",
        password: "password",
        firstName: "Invalid",
        lastName: "User",
        email: "not-an-email",
      });

      expect(res.statusCode).toEqual(400);
    });
  });
});
