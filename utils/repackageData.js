"use strict";

const API_BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const { API_KEY } = require("../config");
const axios = require("axios");
const express = require("express");
const router = express.Router();

/** Helper to repackage data from external API */
function repackageData(data) {
  const daysData = data.days.map(({ datetime, tempmin, tempmax, precipprob, conditions, description, icon }) => ({
    datetime,
    tempmin,
    tempmax,
    precipprob,
    conditions,
    description,
    icon,
  }));

  const { resolvedAddress, description, alerts } = data;
  const alert = alerts.length === 0
    ? { event: "No current alerts" }
    : { event: alerts[0].event, link: alerts[0].link };

  return {
    resolvedAddress,
    description,
    alert,
    days: daysData,
  };
}

/** GET /data?location=...&unit=... 
 *  Fetches weather data for any given location and unit group.
 */
router.get('/data', async function (req, res, next) {
  const { location, unit } = req.query; // Ensure proper query parameters
  try {
    const response = await axios.get(`${API_BASE_URL}${location}?unitGroup=${unit}&key=${API_KEY}`);
    const newData = repackageData(response.data);
    res.json(newData);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
