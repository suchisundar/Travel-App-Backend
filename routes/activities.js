"use strict";

const express = require("express");
const axios = require("axios");
const { authAmadeus } = require("../utils/amadeusAuth"); // Retrieves Amadeus token
const { ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

/** GET /activities?location=cityName => { activities } 
 *
 * Accepts a city/location as a query param.
 * 1. Geocode the location to get lat/lon.
 * 2. Use Amadeus API to fetch activities for the coordinates.
 * 
 * Authorization required: logged in.
 */
router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ error: "Location query is required" });
    }

    // Step 1: Geocode the location using OpenCage API
    const geocodeResponse = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json`,
      {
        params: {
          q: location,
          key: process.env.OPENCAGE_API_KEY, // OpenCage API Key from .env
        },
      }
    );

    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      throw new Error("No geocoding results found");
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry;

    // Step 2: Fetch activities from Amadeus using geocoded coordinates
    const token = await authAmadeus();
    const amadeusResponse = await axios.get(
      `https://test.api.amadeus.com/v1/shopping/activities?latitude=${lat}&longitude=${lng}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!amadeusResponse.data.data) {
      throw new Error("No activities found in Amadeus response");
    }

    const activities = amadeusResponse.data.data.map((activity) => ({
      id: activity.id,
      name: activity.name,
      description: activity.shortDescription,
      price: activity.price.amount,
    }));

    res.json({ activities });
  } catch (err) {
    if (err.response) {
      // Handles external API errors
      console.error("External API error:", err.response.data);
      return res.status(err.response.status).json({ error: err.response.data });
    }
    return next(err);
  }
});

module.exports = router;
