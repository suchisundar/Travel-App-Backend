"use strict";

const express = require("express");
const axios = require("axios");
const { ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

/** GET /geocode/:location => { latitude, longitude }
 *
 * Fetches geocode data for a given location using OpenCage API.
 *
 * Authorization required: logged in
 */
router.get("/:location", ensureLoggedIn, async (req, res, next) => {
  try {
    const location = req.params.location;
    const apiKey = process.env.OPENCAGE_API_KEY; // Add this in .env

    const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
      params: {
        q: location,
        key: apiKey,
      },
    });

    const data = response.data.results[0].geometry;
    const coordinates = {
      latitude: data.lat,
      longitude: data.lng,
    };

    return res.json(coordinates);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
