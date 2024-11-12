"use strict";
jest.setTimeout(10000); // Sets timeout to 10 seconds

const request = require("supertest");
const app = require("../App");
const db = require("../db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(async () => {
  await commonAfterAll();
  await db.end();
});

describe("POST /users", () => {
  test("Registers a new user", async () => {
    const res = await request(app).post("/users").send({
      username: "newuser",
      password: "newpassword",
      first_name: "New",
      last_name: "User",
      email: "newuser@example.com",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      user: {
        username: "newuser",
        first_name: "New",
        last_name: "User",
        email: "newuser@example.com",
      },
    });
  });

  test("Fails to register with duplicate username", async () => {
    const res = await request(app).post("/users").send({
      username: "testuser",
      password: "password123",
      first_name: "Test",
      last_name: "User",
      email: "duplicate@example.com",
    });

    expect(res.statusCode).toBe(400);
  });
});
