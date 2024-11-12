"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");


/** Related functions for users table. */

class User {
  
  /** Authenticate user with username, password, returns { username }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT id, username, password
       FROM users
       WHERE username = $1`,
      [username]
    );
  
    const user = result.rows[0];
  
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password; 
        return user;  
      }
    }
  
    throw new UnauthorizedError("Invalid username/password");
  }
  

  /************** Register user with data; returns { username }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ username, password, firstName, lastName, email }) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );
  
    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }
  
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
  
    const result = await db.query(
      `INSERT INTO users
       (username, password, first_name, last_name, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username`,  
      [username, hashedPassword, firstName, lastName, email]
    );
  
    return result.rows[0]; 
  }
  
  
  /**************** Delete given user; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}


module.exports = User;