// routes/geocode.test.js

"use strict";

const request = require("supertest");
const app = require("../app");
const axios = require("axios");
jest.mock("axios");

const { u1Token } = require("../tests/testCommon");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../tests/testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Geocode Routes", () => {
  /************************************** GET /geocode/:location */

  describe("GET /geocode/:location", () => {
    test("works for logged-in user", async () => {
      // Mock the OpenCage Geocoding API response
      axios.get.mockResolvedValue({
        data: {
          results: [
            {
              geometry: {
                lat: 37.7749,
                lng: -122.4194,
              },
            },
          ],
        },
      });

      const res = await request(app)
        .get("/geocode/San Francisco")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("latitude");
      expect(res.body).toHaveProperty("longitude");
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).get("/geocode/San Francisco");
      expect(res.statusCode).toEqual(401);
    });

    test("handles API errors gracefully", async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { message: "Geocoding API Error" },
        },
      });

      const res = await request(app)
        .get("/geocode/San Francisco")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });
});
