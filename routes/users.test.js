// routes/users.test.js

"use strict";

const request = require("supertest");
const app = require("../app");
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

describe("Users Routes", () => {
  /************************************** GET /users/:username */

  describe("GET /users/:username", () => {
    test("works for correct user", async () => {
      const res = await request(app)
        .get("/users/testuser")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty("username");
      expect(res.body.user.username).toEqual("testuser");
    });

    test("unauth for other users", async () => {
      const res = await request(app)
        .get("/users/seconduser")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(401);
    });

    test("not found if user not found", async () => {
      const res = await request(app)
        .get("/users/nouser")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  /************************************** PATCH /users/:username */

  describe("PATCH /users/:username", () => {
    test("works for correct user", async () => {
      const res = await request(app)
        .patch("/users/testuser")
        .send({ firstName: "Updated" })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.user.firstName).toEqual("Updated");
    });

    test("unauth for other users", async () => {
      const res = await request(app)
        .patch("/users/seconduser")
        .send({ firstName: "Nope" })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(401);
    });

    test("bad request with invalid data", async () => {
      const res = await request(app)
        .patch("/users/testuser")
        .send({ email: "not-an-email" })
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(400);
    });
  });

  /************************************** DELETE /users/:username */

  describe("DELETE /users/:username", () => {
    test("works for correct user", async () => {
      const res = await request(app)
        .delete("/users/testuser")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ deleted: "testuser" });
    });

    test("unauth for other users", async () => {
      const res = await request(app)
        .delete("/users/seconduser")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(401);
    });
  });

  /************************************** GET /users/:username/trips */

  describe("GET /users/:username/trips", () => {
    test("works for correct user", async () => {
      const res = await request(app)
        .get("/users/testuser/trips")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.trips)).toBe(true);
    });

    test("unauth for other users", async () => {
      const res = await request(app)
        .get("/users/seconduser/trips")
        .set("authorization", `Bearer ${u1Token}`);

      expect(res.statusCode).toEqual(401);
    });
  });
});
