"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const Trip = require("../models/trip");
const User = require("../models/user");
const { BadRequestError, NotFoundError } = require("../expressError");
const tripSchema = require("../schemas/tripschema.json");
const activitySchema = require("../schemas/activityschema.json");
const { repackageData } = require("../utils/repackageData");
const {authAmadeus} = require("../utils/amadeusAuth");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const axios = require("axios");
const { API_BASE_URL, API_KEY } = require("../config");

const router = new express.Router();

/** POST /trips { trip } => { trip }
 *
 * Adds a new trip for the logged-in user.
 *
 * Data should include: { location, start_date, end_date }
 *
 * Authorization required: logged in
 */
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, tripSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const username = res.locals.user.username;
    const user = await User.get(username); 

    const { location, start_date, end_date } = req.body;

    const trip = await Trip.create({
      user_id: user.id,
      location,
      start_date,
      end_date,
    });

    return res.status(201).json({ trip });
  } catch (err) {
    return next(err);
  }
});

/** POST /:tripId/packinglist { item_name } => { packingListItem }
 * Adds an item to the packing list for a trip.
 * Authorization required: correct user
 */
router.post("/:tripId/packinglist", ensureCorrectUser, async function (req, res, next) {
  try {
    const { item_name } = req.body;
    const packingListItem = await Trip.addPackingItem({
      trip_id: req.params.tripId,
      item_name,
    });
    return res.status(201).json({ packingListItem });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /packing-items/:itemId { is_checked } => { packingItem }
 * Updates a packing item's checked status.
 * Authorization required: correct user
 */
router.patch("/packing-items/:itemId", ensureCorrectUser, async function (req, res, next) {
  try {
    const { is_checked } = req.body;
    const updatedItem = await Trip.updatePackingItemStatus(req.params.itemId, is_checked);
    return res.json({ packingItem: updatedItem });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /packing-items/:itemId => { deleted: itemId }
 * Deletes a packing item by item ID.
 * Authorization required: correct user
 */
router.delete("/packing-items/:itemId", ensureCorrectUser, async function (req, res, next) {
  try {
    await Trip.deletePackingItem(req.params.itemId);
    return res.json({ deleted: req.params.itemId });
  } catch (err) {
    return next(err);
  }
});


/** GET /packinglist/:tripId => { packingList }
 *
 * Gets the packing list for a trip.
 *
 * Authorization required: logged in
 */

router.get("/:tripId/packinglist", ensureLoggedIn, async function (req, res, next) {
  try {
    const packingList = await Trip.getPackingItems(req.params.tripId);
    return res.json({ packingList });
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

    const updatedTrip = await Trip.updateTrip(tripId, location, start_date, end_date);

    const weatherData = await Trip.getWeather(updatedTrip.location, updatedTrip.start_date, updatedTrip.end_date);

    await Trip.deleteWeatherForTrip(tripId);
    await Promise.all(
      weatherData.map((day) => Trip.addWeather({ trip_id: tripId, ...day }))
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

/** GET /:tripId => { trip }
 *
 * Gets details of a specific trip by ID.
 *
 * Authorization required: logged in
 */
router.get("/:tripId", ensureLoggedIn, async (req, res, next) => {
  try {
    const trip = await Trip.get(req.params.tripId);
    if (!trip) throw new NotFoundError(`Trip not found: ${req.params.tripId}`);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
});

/** GET /:tripId/weather => { weather }
 *
 * Fetches stored or live weather data for a trip based on tripId.
 *
 * Authorization required: logged in
 */
router.get("/:tripId/weather", ensureLoggedIn, async function (req, res, next) {
  try {
    const trip = await Trip.get(req.params.tripId);
    if (!trip) throw new NotFoundError(`Trip not found: ${req.params.tripId}`);
    const { location, start_date, end_date } = trip;

    const response = await axios.get(
      `${API_BASE_URL}${location}/${start_date}/${end_date}?unitGroup=metric&key=${API_KEY}`
    );

    const weatherData = repackageData(response.data);
    res.json(weatherData);
  } catch (err) {
    console.error("Weather API Error:", err);
    return next(err);
  }
});

/** GET /activitysearch?location=... => { activities }
 * Searches activities in a location using Amadeus API.
 * Authorization required: logged in
 */
router.get("/activitysearch", ensureLoggedIn, async function (req, res, next) {
  try {
    const { location } = req.query;
    const token = await authAmadeus();
    const response = await axios.get(`https://test.api.amadeus.com/v1/shopping/activities`, {
      params: { latitude: location.lat, longitude: location.lng },
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.json({ activities: response.data.data });
  } catch (err) {
    console.error("Activity Search Error:", err);
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

module.exports = router;
