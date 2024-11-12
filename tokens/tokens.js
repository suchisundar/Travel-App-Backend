const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Return signed JWT from user data. 
 * Payload: { username }
 */

function createToken(user) {
  let payload = {
    id: user.id,
    username: user.username,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
}


module.exports = { createToken };