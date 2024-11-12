"use strict";

const { createToken } = require("../tokens/tokens");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

describe("createToken", () => {
  test("creates a valid token", () => {
    const payload = { id: 1, username: "testuser" };
    const token = createToken(payload);
    const decoded = jwt.verify(token, SECRET_KEY);

    expect(decoded).toEqual(
      expect.objectContaining({
        id: 1,
        username: "testuser",
        iat: expect.any(Number),
        exp: expect.any(Number),
      })
    );
  });

  test("token includes expiration", () => {
    const payload = { id: 2, username: "anotheruser" };
    const token = createToken(payload);
    const decoded = jwt.verify(token, SECRET_KEY);

    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });
});
