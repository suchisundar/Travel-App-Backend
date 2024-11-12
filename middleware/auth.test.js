"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("./auth");
const { SECRET_KEY } = require("../config");

const testJwt = jwt.sign({ username: "testuser" }, SECRET_KEY);
const badJwt = jwt.sign({ username: "testuser" }, "wrong-secret");

describe("authenticateJWT", function () {
  test("works: valid token provided in header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };

    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        username: "testuser",
        iat: expect.any(Number),
      },
    });
  });

  test("works: no token provided", function () {
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };

    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token provided", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };

    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureLoggedIn", function () {
  test("works: user is logged in", function () {
    const req = {};
    const res = { locals: { user: { username: "testuser" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };

    ensureLoggedIn(req, res, next);
  });

  test("unauth: user is not logged in", function () {
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };

    ensureLoggedIn(req, res, next);
  });
});

describe("ensureCorrectUser", function () {
  test("works: correct user", function () {
    const req = { params: { username: "testuser" } };
    const res = { locals: { user: { username: "testuser" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };

    ensureCorrectUser(req, res, next);
  });

  test("unauth: different user", function () {
    const req = { params: { username: "wronguser" } };
    const res = { locals: { user: { username: "testuser" } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };

    ensureCorrectUser(req, res, next);
  });

  test("unauth: no user in locals", function () {
    const req = { params: { username: "testuser" } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };

    ensureCorrectUser(req, res, next);
  });
});
