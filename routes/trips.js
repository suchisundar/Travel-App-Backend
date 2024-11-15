"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const Trip = require("../models/trip");
const { BadRequestError, NotFoundError } = require("../expressError");
const tripSchema = require("../schemas/tripschema.json");
const activitySchema = require("../schemas/activityschema.json");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const router = new express.Router();

/** POST /:username/trips { trip } => { trip }
 *
 * Adds a new trip.
 *
 * Authorization required: correct user
 */
router.post("/:username/trips", ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, tripSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const trip = await Trip.create({ ...req.body, username: req.params.username });

    // Fetch weather data dynamically and store it.
    const weatherData = await Trip.getWeather(trip.location, trip.start_date, trip.end_date);
    await Promise.all(
      weatherData.map((day) =>
        Trip.addWeather({ trip_id: trip.id, ...day })
      )
    );

    return res.status(201).json({ trip });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:tripId { location, start_date, end_date } => { trip }
 *
 * Updates the trip's location and/or dates, and updates the weather data for the new location and dates.
 *
 * Authorization required: logged in
 */
router.patch("/:tripId", ensureLoggedIn, async function (req, res, next) {
  try {
    const { location, start_date, end_date } = req.body;
    const tripId = req.params.tripId;

    // Update the trip location and/or dates
    const updatedTrip = await Trip.updateTrip(tripId, location, start_date, end_date);

    // Fetch new weather data for the updated location and dates
    const weatherData = await Trip.getWeather(updatedTrip.location, updatedTrip.start_date, updatedTrip.end_date);

    // Remove old weather data for the trip and add new weather data
    await Trip.deleteWeatherForTrip(tripId);
    await Promise.all(
      weatherData.map((day) =>
        Trip.addWeather({ trip_id: tripId, ...day })
      )
    );

    return res.json({ trip: updatedTrip });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/trips => { trips }
 *
 * Gets all trips for a user.
 *
 * Authorization required: correct user
 */
router.get("/:username/trips", ensureCorrectUser, async function (req, res, next) {
  try {
    const trips = await Trip.getUserTrips(req.params.username);
    return res.json({ trips });
  } catch (err) {
    return next(err);
  }
});

/** POST /:tripId/activities { activity } => { activity }
 *
 * Adds an activity to a trip.
 *
 * Authorization required: logged in
 */
router.post("/:tripId/activities", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, activitySchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const activity = await Trip.addActivity({
      trip_id: req.params.tripId,
      date: req.body.date,
      description: req.body.description,
    });

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
    const activities = await Trip.getActivities(req.params.tripId);
    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
});

/** POST /:tripId/packinglist { item } => { packingListItem }
 *
 * Adds an item to the packing list for a trip.
 *
 * Authorization required: logged in
 */
router.post("/:tripId/packinglist", ensureLoggedIn, async (req, res, next) => {
  try {
    const packingListItem = await Trip.addPackingItem({
      trip_id: req.params.tripId,
      item_name: req.body.item_name,
    });

    return res.status(201).json({ packingListItem });
  } catch (err) {
    return next(err);
  }
});

/** GET /:tripId/packinglist => { packingList }
 *
 * Gets all packing items for a trip.
 *
 * Authorization required: logged in
 */
router.get("/:tripId/packinglist", ensureLoggedIn, async (req, res, next) => {
  try {
    const packingList = await Trip.getPackingItems(req.params.tripId);
    return res.json({ packingList });
  } catch (err) {
    return next(err);
  }
});

/** GET /:tripId/weather => { weather }
 *
 * Fetches stored weather data for a trip.
 *
 * Authorization required: logged in
 */
router.get("/:tripId/weather", ensureLoggedIn, async (req, res, next) => {
  try {
    const weather = await Trip.getWeatherForTrip(req.params.tripId);
    return res.json({ weather });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
