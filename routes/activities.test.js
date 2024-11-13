"use strict";

const request = require("supertest");
const app = require("../App");
const axios = require("axios");
jest.mock("axios");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /activities", () => {
  test("fetches activities for a location from Amadeus after geocoding", async () => {
    const mockGeocodeData = {
      results: [{ geometry: { lat: 37.7749, lng: -122.4194 } }],
    };

    const mockAmadeusData = {
      data: [
        {
          id: "1",
          name: "Golden Gate Tour",
          shortDescription: "A beautiful tour of SF.",
          price: { amount: 45 },
        },
      ],
    };

    // Mock Geocode API
    axios.get.mockResolvedValueOnce({ data: mockGeocodeData });

    // Mock Amadeus API
    axios.get.mockResolvedValueOnce({ data: mockAmadeusData });

    const res = await request(app)
      .get("/activities")
      .query({ location: "San Francisco" })
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.activities).toHaveLength(1);
  });

  test("handles geocoding failure gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Geocoding API failure"));

    const res = await request(app)
      .get("/activities")
      .query({ location: "InvalidCity" })
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(500);
  });

  test("handles Amadeus API failure gracefully", async () => {
    const mockGeocodeData = {
      results: [{ geometry: { lat: 37.7749, lng: -122.4194 } }],
    };

    axios.get.mockResolvedValueOnce({ data: mockGeocodeData });
    axios.get.mockRejectedValueOnce(new Error("Amadeus API failure"));

    const res = await request(app)
      .get("/activities")
      .query({ location: "San Francisco" })
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(500);
  });
});
