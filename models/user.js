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
