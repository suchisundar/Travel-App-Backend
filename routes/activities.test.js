// routes/activities.test.js

"use strict";

const request = require("supertest");
const app = require("../app");
const axios = require("axios");
jest.mock("axios"); // Mock axios for testing

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("../tests/testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Activities Routes", () => {
  /************************************** GET /activities?location=cityName */

  describe("GET /activities", () => {
    test("works for logged-in user: retrieves activities", async () => {
      // Mock the OpenCage Geocoding API response
      axios.get.mockImplementationOnce(() =>
        Promise.resolve({
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
        })
      );

      // Mock the Amadeus API response
      axios.get.mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [
              {
                id: "1",
                name: "Golden Gate Bridge Tour",
                shortDescription: "Visit the iconic Golden Gate Bridge.",
                price: {
                  amount: "30.00",
                },
              },
              // Add more activities as needed
            ],
          },
        })
      );

      const res = await request(app)
        .get("/activities?location=San Francisco")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.activities)).toBe(true);
      expect(res.body.activities.length).toBeGreaterThan(0);
      expect(res.body.activities[0]).toHaveProperty("id");
      expect(res.body.activities[0]).toHaveProperty("name");
      expect(res.body.activities[0]).toHaveProperty("description");
      expect(res.body.activities[0]).toHaveProperty("price");
    });

    test("unauthenticated user: returns 401", async () => {
      const res = await request(app).get("/activities?location=San Francisco");
      expect(res.statusCode).toEqual(401);
    });

    test("error from external API: handles gracefully", async () => {
      // Mock the OpenCage API to fail
      axios.get.mockImplementationOnce(() =>
        Promise.reject({
          response: {
            status: 500,
            data: { message: "Geocoding API Error" },
          },
        })
      );

      const res = await request(app)
        .get("/activities?location=San Francisco")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });
});
