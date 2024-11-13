"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const axios = require("axios");
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
    req.body.trip_id = parseInt(req.params.tripId, 10);

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

/** GET /:tripId/activities => { activities }
 *
 * Gets all activities for a trip.
 *
 * Authorization required: logged in
 */
router.get("/:tripId/activities", ensureLoggedIn, async (req, res, next) => {
  try {
    const activities = await Trip.getActivities(parseInt(req.params.tripId, 10));
    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
});

/** GET /:tripId/weather => { weather }
 *
 * Fetches weather data for a trip from Visual Crossing.
 *
 * Authorization required: logged in
 */
router.get("/:tripId/weather", ensureLoggedIn, async (req, res, next) => {
  try {
    const { location, startDate, endDate } = req.query;
    const apiKey = process.env.VISUALCROSSING_API_KEY;

    if (!location || !startDate || !endDate) {
      throw new BadRequestError("Location, startDate, and endDate query parameters are required");
    }

    const response = await axios.get(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${startDate}/${endDate}`,
      {
        params: {
          key: apiKey,
          unitGroup: "us",
        },
      }
    );

    const weatherData = response.data.days.map((day) => ({
      date: day.datetime,
      tempmax: day.tempmax,
      tempmin: day.tempmin,
      precipprob: day.precipprob,
      conditions: day.conditions,
      icon: day.icon,
    }));

    return res.json({ weather: weatherData });
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
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const weather = await Trip.addWeather(req.body);
    return res.status(201).json({ weather });
  } catch (err) {
    return next(err);
  }
});

/** GET /recommendations => { packingList }
 *
 * Get trip recommendations based on weather and activities.
 */
router.get("/recommendations", (req, res) => {
  const { weather, activities } = req.query;
  const activityList = activities ? activities.split(",") : [];

  const recommendations = Trip.getPackingRecommendations(weather, activityList);
  return res.json({ packingList: recommendations });
});

module.exports = router;
