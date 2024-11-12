"use strict";
jest.setTimeout(30000); 

const request = require("supertest");
const app = require("../App");

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

describe("POST /trips/:tripId/packinglist", () => {
  test("Adds an item to the packing list", async () => {
    const res = await request(app)
      .post("/trips/1/packinglist")
      .send({ item: "Raincoat", category: "clothing" })
      .set("Authorization", `Bearer ${u1Token}`);
      
    expect(res.statusCode).toBe(201);
    expect(res.body.packingListItem.item).toEqual("Raincoat");
  });
});
