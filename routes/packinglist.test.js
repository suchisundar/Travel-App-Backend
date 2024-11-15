"use strict";
jest.setTimeout(30000); 
const { createToken } = require("../tokens/tokens");

const request = require("supertest");
const app = require("../app");

const { 
  commonBeforeAll, 
  commonBeforeEach, 
  commonAfterEach, 
  commonAfterAll, 
  //u1Token 
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /trips/:tripId/packinglist", () => {
  test("Adds an item to the packing list", async () => {
    const u1Token = createToken({ id: 1, username: "testuser" });
    const res = await request(app)
      .post("/trips/1/packinglist")
      .send({ item_name: "Raincoat" })
      .set("Authorization", `Bearer ${u1Token}`);
      console.log(`Bearer ${u1Token}`);
      
    expect(res.statusCode).toBe(201);
    expect(res.body.packingListItem.item).toEqual("Raincoat");
  });
});
