"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const Trip = require("../models/trip");
const User = require("../models/user");
const { BadRequestError, NotFoundError } = require("../expressError");
const tripSchema = require("../schemas/tripschema.json");
const activitySchema = require("../schemas/activityschema.json");
const repackageData = require("../utils/repackageData");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const axios = require("axios");
const { API_BASE_URL, API_KEY } = require("../config");
const { formatISO, parseISO } = require("date-fns");
const weatherCache = {};
const router = new express.Router();

/** Helper: Get weather data for a location and date range */
const getWeather = async (location, start_date, end_date) => {
  console.log("getWeather called with:", { location, start_date, end_date });
  const cacheKey = `${location}-${start_date}-${end_date}`;

  // Check if data is in cache
  if (weatherCache[cacheKey]) {
    console.log("Returning cached weather data");
    return weatherCache[cacheKey];
  }

  // Convert start_date to a Date object
  let startDateObj;
  if (typeof start_date === "string") {
    startDateObj = parseISO(start_date);
  } else if (start_date instanceof Date) {
    startDateObj = start_date;
  } else {
    throw new Error("start_date is neither a string nor a Date object");
  }

  // Convert end_date to a Date object
  let endDateObj;
  if (typeof end_date === "string") {
    endDateObj = parseISO(end_date);
  } else if (end_date instanceof Date) {
    endDateObj = end_date;
  } else {
    throw new Error("end_date is neither a string nor a Date object");
  }

  // Validate that the dates are valid
  if (isNaN(startDateObj.getTime())) {
    throw new Error(`Invalid start_date: ${start_date}`);
  }
  if (isNaN(endDateObj.getTime())) {
    throw new Error(`Invalid end_date: ${end_date}`);
  }

  // Format the dates to ISO string
  const start = formatISO(startDateObj, { representation: "date" });
  const end = formatISO(endDateObj, { representation: "date" });

  console.log("Formatted dates:", { start, end });

  try {
    // Proceed with the API call
    const response = await axios.get(
      `${API_BASE_URL}${encodeURIComponent(location)}/${start}/${end}?unitGroup=metric&key=${API_KEY}`
    );

    console.log("Weather API response data:", response.data);

    if (!response.data || !response.data.days) {
      throw new Error(
        `Invalid response from weather API: ${JSON.stringify(response.data)}`
      );
    }

    // Repackage the data
    const weatherData = repackageData(response.data);

    // Store the data in cache
    weatherCache[cacheKey] = weatherData;

    return weatherData;
  } catch (err) {
    console.error(
      "Error fetching weather data:",
      err.response ? err.response.data : err.message
    );
    throw new Error("Failed to fetch weather data");
  }
};

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
 *
 * Adds an item to the packing list for a trip.
 *
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
 *
 * Updates a packing item's checked status.
 *
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
 *
 * Deletes a packing item by item ID.
 *
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

/** GET /:tripId/packinglist => { packingList }
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

    const formattedStartDate = formatISO(parseISO(start_date), { representation: "date" });
    const formattedEndDate = formatISO(parseISO(end_date), { representation: "date" });

    const updatedTrip = await Trip.updateTrip(tripId, location, formattedStartDate, formattedEndDate);

    const weatherData = await getWeather(updatedTrip.location, formattedStartDate, formattedEndDate);

    await Trip.deleteWeatherForTrip(tripId);
    await Promise.all(weatherData.days.map((day) => Trip.addWeather({ trip_id: tripId, ...day })));

    return res.json({ trip: updatedTrip });
  } catch (err) {
    console.error("Error updating trip or fetching weather:", err);
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
router.get("/:tripId", ensureLoggedIn, async function (req, res, next) {
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

    const weatherData = await getWeather(location, start_date, end_date);

    res.json({ weather: weatherData }); 
  } catch (err) {
    console.error("Weather API Error:", err.message);
    return next(err);
  }
});


/** POST /:tripId/activities => { activity }
 *
 * Adds an activity to a trip.
 *
 * Authorization required: logged in
 */
router.post("/:tripId/activities", ensureLoggedIn, async function (req, res, next) {
  try {
    const activityData = {
      trip_id: parseInt(req.params.tripId),
      date: req.body.date,
      description: req.body.description,
    };

    // Validate activityData using activitySchema
    const validator = jsonschema.validate(activityData, activitySchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const activity = await Trip.addActivity(activityData);

    return res.status(201).json({ activity });
  } catch (err) {
    return next(err);
  }
});

/** GET /:tripId/activities => { activities: [...] }
 *
 * Retrieves all activities for a trip.
 *
 * Authorization required: logged in
 */
router.get("/:tripId/activities", ensureLoggedIn, async function (req, res, next) {
  try {
    const activities = await Trip.getActivities(req.params.tripId);
    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
