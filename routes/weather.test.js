"use strict";
jest.setTimeout(10000); // Sets timeout to 10 seconds

const request = require("supertest");
const app = require("../App");
const axios = require("axios");
jest.mock("axios");

const { 
  commonBeforeAll, 
  commonBeforeEach, 
  commonAfterEach, 
  commonAfterAll, 
  u1Token 
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /trips/:tripId/weather", () => {
  test("Fetches weather data for a trip", async () => {
    axios.get.mockResolvedValue({
      data: {
        location: { address: "San Francisco, CA" },
        days: [
          { datetime: "2024-12-01", tempmax: 60, tempmin: 50, precipprob: 10, conditions: "Partly Cloudy" },
        ],
      },
    });

    const res = await request(app)
      .get("/trips/1/weather")
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.weather[0]).toHaveProperty("conditions", "Partly Cloudy");
  });

  test("Handles weather API failure", async () => {
    axios.get.mockRejectedValue(new Error("API failure"));

    const res = await request(app)
      .get("/trips/1/weather")
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(500);
  });
});
