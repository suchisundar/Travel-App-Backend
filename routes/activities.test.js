"use strict";
jest.setTimeout(10000); // Sets timeout to 10 seconds

const request = require("supertest");
const app = require("../App");
const axios = require("axios");
const { db } = require("../db"); // Ensure db is imported here

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

jest.mock("axios");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(async () => {
  await commonAfterAll();
  
});

describe("GET /trips/:tripId/activities", () => {
  test("retrieves activities for a trip from the database", async () => {
    const res = await request(app)
      .get("/trips/1/activities")
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.activities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ description: "Visit Golden Gate Park" }),
      ])
    );
  });

  test("retrieves activities from Amadeus API", async () => {
    const mockAmadeusData = {
      data: [
        {
          id: "1",
          name: "Golden Gate Bridge Tour",
          shortDescription: "A guided tour of the iconic bridge.",
          price: { amount: 45 },
        },
      ],
    };

    axios.get.mockResolvedValue(mockAmadeusData);

    const res = await request(app)
      .get("/activities/San%20Francisco")
      .set("Authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.activities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Golden Gate Bridge Tour",
          price: 45,
        }),
      ])
    );
  });
});
