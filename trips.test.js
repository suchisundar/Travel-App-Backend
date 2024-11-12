const db = require("./db");
const { getDatabaseUri } = require("./config");

describe("Database Setup", () => {
  it("should connect to the test database", async () => {
    const res = await db.query("SELECT NOW()");
    expect(res).toBeDefined();
  });

  it("should have the trips table", async () => {
    const result = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'trips'");
    expect(result.rows.length).toBe(1);  // There should be exactly one trips table
  });

  it("should have the trip_dates table", async () => {
    const result = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'trip_dates'");
    expect(result.rows.length).toBe(1);  // There should be exactly one trip_dates table
  });

  it("should have the trip_activities table", async () => {
    const result = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'trip_activities'");
    expect(result.rows.length).toBe(1);  // There should be exactly one trip_activities table
  });
});
