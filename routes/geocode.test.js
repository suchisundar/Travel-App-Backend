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
} = require("./_testCommon");

jest.mock("axios");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /geocode/:location", () => {
  test("Translates a location to coordinates", async () => {
    const mockData = {
      location: { latitude: 37.7749, longitude: -122.4194 },
    };

    axios.get.mockResolvedValue({ data: mockData });

    const res = await request(app).get("/geocode/San%20Francisco");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData.location);
  });
});
