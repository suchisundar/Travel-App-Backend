// routes/trips.test.js

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

describe("Trips Routes", () => {
  /************************************** POST /trips */

  describe("POST /trips", () => {
    test("works for logged-in user", async () => {
      const res = await request(app)
        .post("/trips")
        .send({
          location: "Paris",
          start_date: "2024-12-10",
          end_date: "2024-12-15",
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(201);
      expect(res.body.trip).toHaveProperty("id");
      expect(res.body.trip.location).toEqual("Paris");
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).post("/trips").send({
        location: "Paris",
        start_date: "2024-12-10",
        end_date: "2024-12-15",
      });

      expect(res.statusCode).toEqual(401);
    });

    test("bad request with missing data", async () => {
      const res = await request(app)
        .post("/trips")
        .send({
          location: "Paris",
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(400);
    });
  });

  /************************************** GET /trips/:tripId */

  describe("GET /trips/:tripId", () => {
    test("works for logged-in user", async () => {
      const res = await request(app)
        .get("/trips/1")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.trip).toHaveProperty("id");
      expect(res.body.trip.id).toEqual(1);
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).get("/trips/1");
      expect(res.statusCode).toEqual(401);
    });

    test("not found if trip does not exist", async () => {
      const res = await request(app)
        .get("/trips/9999")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  /************************************** GET /trips/:tripId/weather */

  describe("GET /trips/:tripId/weather", () => {
    test("works for logged-in user", async () => {
      axios.get.mockResolvedValue({
        data: {
          days: [
            {
              datetime: "2024-11-05",
              tempmax: 65,
              tempmin: 50,
              description: "Sunny",
              icon: "clear-day",
            },
            // Add more days as needed
          ],
        },
      });

      const res = await request(app)
        .get("/trips/1/weather")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.weather).toBeDefined();
      expect(res.body.weather.days.length).toBeGreaterThan(0);
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).get("/trips/1/weather");
      expect(res.statusCode).toEqual(401);
    });
  });

  /************************************** POST /trips/:tripId/activities */

  describe("POST /trips/:tripId/activities", () => {
    test("works for logged-in user", async () => {
      const res = await request(app)
        .post("/trips/1/activities")
        .send({
          date: "2024-11-06",
          description: "Visit Louvre Museum",
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(201);
      expect(res.body.activity).toHaveProperty("id");
      expect(res.body.activity.description).toEqual("Visit Louvre Museum");
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).post("/trips/1/activities").send({
        date: "2024-11-06",
        description: "Visit Louvre Museum",
      });

      expect(res.statusCode).toEqual(401);
    });

    test("bad request with invalid data", async () => {
      const res = await request(app)
        .post("/trips/1/activities")
        .send({
          description: "No date provided",
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(400);
    });
  });

  /************************************** GET /trips/:tripId/activities */

  describe("GET /trips/:tripId/activities", () => {
    test("works for logged-in user", async () => {
      const res = await request(app)
        .get("/trips/1/activities")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.activities)).toBe(true);
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).get("/trips/1/activities");
      expect(res.statusCode).toEqual(401);
    });
  });

  /************************************** POST /trips/:tripId/packinglist */

  describe("POST /trips/:tripId/packinglist", () => {
    test("works for logged-in user", async () => {
      const res = await request(app)
        .post("/trips/1/packinglist")
        .send({ item_name: "Umbrella" })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(201);
      expect(res.body.packingListItem).toHaveProperty("id");
      expect(res.body.packingListItem.item_name).toEqual("Umbrella");
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).post("/trips/1/packinglist").send({ item_name: "Umbrella" });
      expect(res.statusCode).toEqual(401);
    });

    test("bad request with missing data", async () => {
      const res = await request(app)
        .post("/trips/1/packinglist")
        .send({})
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(400);
    });
  });

  /************************************** GET /trips/:tripId/packinglist */

  describe("GET /trips/:tripId/packinglist", () => {
    test("works for logged-in user", async () => {
      const res = await request(app)
        .get("/trips/1/packinglist")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.packingList)).toBe(true);
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).get("/trips/1/packinglist");
      expect(res.statusCode).toEqual(401);
    });
  });

  /************************************** PATCH /packing-items/:itemId */

  describe("PATCH /packing-items/:itemId", () => {
    test("works for logged-in user", async () => {
      const res = await request(app)
        .patch("/packing-items/1")
        .send({ is_checked: true })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.packingItem.is_checked).toEqual(true);
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app)
        .patch("/packing-items/1")
        .send({ is_checked: true });

      expect(res.statusCode).toEqual(401);
    });
  });

  /************************************** DELETE /packing-items/:itemId */

  describe("DELETE /packing-items/:itemId", () => {
    test("works for logged-in user", async () => {
      const res = await request(app)
        .delete("/packing-items/1")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ deleted: "1" });
    });

    test("unauthenticated users: returns 401", async () => {
      const res = await request(app).delete("/packing-items/1");
      expect(res.statusCode).toEqual(401);
    });
  });
});
