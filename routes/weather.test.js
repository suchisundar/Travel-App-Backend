"use strict";

jest.setTimeout(10000); 

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
        days: [
          {
            datetime: "2024-12-01",
            tempmax: 60,
            tempmin: 50,
            precipprob: 10,
            conditions: "Partly Cloudy",
            icon: "partly-cloudy-day",
          },
        ],
      },
    });

    const res = await request(app)
      .get("/trips/1/weather?location=San%20Francisco&startDate=2024-12-01&endDate=2024-12-07")
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.weather[0]).toHaveProperty("conditions", "Partly Cloudy");
  });

  test("Handles weather API failure", async () => {
    axios.get.mockRejectedValue(new Error("API failure"));

    const res = await request(app)
      .get("/trips/1/weather?location=San%20Francisco&startDate=2024-12-01&endDate=2024-12-07")
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("API failure");
  });
});
