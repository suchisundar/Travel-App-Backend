"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const Trip = require("../models/trip");
const { BadRequestError } = require("../expressError");

const tripSchema = require("../schemas/tripschema.json");
const activitySchema = require("../schemas/activityschema.json");
const weatherSchema = require("../schemas/weatherschema.json");

const { ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

/** POST / { trip } => { trip }
 *
 * Adds a new trip.
 *
 * Authorization required: logged in
 */
router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, tripSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // Add userId from res.locals.user to the request data
    const userId = res.locals.user.id; 
    const tripData = { ...req.body, userId };

    const trip = await Trip.create(tripData);
    return res.status(201).json({ trip });
  } catch (err) {
    return next(err);
  }
});


/** POST /:tripId/activities { activity } => { activity }
 *
 * Adds an activity to an existing trip.
 *
 * Authorization required: logged in
 */
router.post("/:tripId/activities", ensureLoggedIn, async (req, res, next) => {
  try {
    // Attach trip_id from the URL to the request body
    req.body.trip_id = parseInt(req.params.tripId, 10); // Ensure it's an integer

    const validator = jsonschema.validate(req.body, activitySchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const activity = await Trip.addActivity(req.body);
    return res.status(201).json({ activity });
  } catch (err) {
    return next(err);
  }
});

/** GET /:tripId/activities */ 
router.get("/:tripId/activities", ensureLoggedIn, async (req, res, next) => {
  try {
    const activities = await Trip.getActivities(parseInt(req.params.tripId, 10));
    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
});


/** POST /:tripId/weather { weather } => { weather }
 *
 * Adds weather data to an existing trip.
 *
 * Authorization required: logged in
 */
router.post("/:tripId/weather", ensureLoggedIn, async (req, res, next) => {
  try {
    req.body.trip_id = req.params.tripId;

    const validator = jsonschema.validate(req.body, weatherSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const weather = await Trip.addWeather(req.body);
    return res.status(201).json({ weather });
  } catch (err) {
    return next(err);
  }
});

/** Get trip recommendations based on weather and activities */

router.get("/recommendations", (req, res) => {
  const { weather, activities } = req.query;
  const activityList = activities.split(",");

  const recommendations = Trip.getPackingRecommendations(weather, activityList);
  return res.json({ packingList: recommendations });
});



module.exports = router;
