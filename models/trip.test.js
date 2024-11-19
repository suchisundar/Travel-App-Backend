"use strict";

const Trip = require("./trip");

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

describe("Trip Model", () => {
  test("create trip", async () => {
    const trip = await Trip.create({
      user_id: 1,
      location: "Paris",
      start_date: "2024-12-10",
      end_date: "2024-12-15",
    });

    expect(trip).toHaveProperty("id");
    expect(trip.location).toEqual("Paris");
  });

  
});
