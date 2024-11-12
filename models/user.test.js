"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
                  } = require("../expressError");

const db = require("../db.js");
const User = require("./user.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
                  } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
  
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({ username: "u1" });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("noUser", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("u1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "New",
    lastName: "User",
    email: "newuser@test.com",
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });

    expect(user).toEqual({
      username: "new",
      firstName: "New",
      lastName: "User",
      email: "newuser@test.com",
    });

    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with duplicate data", async function () {
    try {
      await User.register({
        username: "u1", // Already exists
        password: "password",
        firstName: "U1",
        lastName: "User",
        email: "duplicate@test.com",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toEqual("Duplicate username: u1");
    }
  });
});
