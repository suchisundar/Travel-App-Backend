"use strict";


const request = require("supertest");
const app = require("../App");
const { db } = require("../db");
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

describe("GET /trips", () => {
  test("Gets all trips for user", async () => {
    const resp = await request(app)
      .get("/trips")
      .set("Authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.trips).toHaveLength(1);
  });

  test("unauth for anon", async () => {
    const resp = await request(app).get("/trips");
    expect(resp.statusCode).toBe(401);
  });
});
