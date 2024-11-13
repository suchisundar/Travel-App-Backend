"use strict";

const request = require("supertest");
const app = require("../App");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

beforeAll(async () => {
  await commonBeforeAll();
});
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(async () => {
  await commonAfterAll();
});

describe("GET /users/:username/trips", () => {
  test("Gets all trips for user", async () => {
    const resp = await request(app)
      .get("/users/testuser/trips") // Ensure the username matches the seeded user
      .set("Authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.trips).toHaveLength(1); // Ensure your seeding creates 1 trip
    expect(resp.body.trips[0]).toHaveProperty("id");
    expect(resp.body.trips[0]).toHaveProperty("location");
  });

  test("unauth for anon", async () => {
    const resp = await request(app).get("/users/testuser/trips");
    expect(resp.statusCode).toBe(401);
  });
});
