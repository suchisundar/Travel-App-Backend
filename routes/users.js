"use strict";

const express = require("express");
const Trip = require("../models/trip");
const User = require("../models/user"); 
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");
const tripSchema = require("../schemas/tripschema.json");

const { ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

/** POST /:username/trips { trip } => { trip }
 *
 * Adds a new trip for the user.
 *
 * Authorization required: logged in
 */
router.post("/:username/trips", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, tripSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const trip = await Trip.create({ ...req.body, username: req.params.username });
    return res.status(201).json({ trip });
  } catch (err) {
    return next(err);
  }
});


/** GET /:username => { user }
 *
 * Returns { username, firstName, lastName, email, etc. }
 *
 * Authorization required: admin or correct user
 */
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /:username => { deleted: username }
 *
 * Authorization required: correct user
 */
router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:username { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email }.
 *
 * Authorization required: correct user
 */
router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** GET /:username/trips => { trips: [ trip, ... ] }
 *
 * Returns list of all trips for a user.
 *
 * Authorization required: logged in
 */
router.get("/:username/trips", ensureLoggedIn, async function (req, res, next) {
  try {
    const trips = await Trip.getUserTrips(req.params.username);
    return res.json({ trips });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
