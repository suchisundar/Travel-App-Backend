const API_BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const { API_KEY } = require("../config");
const axios = require("axios");
const express = require("express");
const router = express.Router();

/** helper method for pulling only the data needed
 *  from the external API and repackaging it.
 * 
 * Note - JSON received from API contains 11K+ lines
 */

function repackageData(data) {

  const daysData = data.days
    .map(({
      datetime,
      tempmin,
      tempmax,
      precipprob,
      conditions,
      description,
      icon,
      
    }) => ({
      datetime,
      tempmin,
      tempmax,
      precipprob,
      conditions,
      description,
      icon,
  }));

  const {resolvedAddress, description, alerts} = data;
  const alert = (alerts.length === 0)
    ? { event: "No current alerts" } :
    {
      event: alerts[0].event,
      link: alerts[0].link
    }

  const newData = {
    resolvedAddress,
    description,
    alert,
    days: daysData
  }
  console.log(newData)
  return newData;
}

/** GET / {data} => {processed_data}
 * 
 * Gets data from external weather API
 * NO autho required
 */

router.get('/data', async function (req, res, next) {
  const location = req.query.location;
  const unitGroup = req.query.unit; // metric or US
  console.log("THE QUERY IS ", req.query)
  try {
    const response = await axios.get(`${API_BASE_URL}${location}?unitGroup=${unitGroup}&key=${API_KEY}`);
    const data = response.data;

    console.log("Location in Express is ", location)
    console.log("Resolved Address in Express is ", data.resolvedAddress)

    const newData = repackageData(data);
    
    // res.send(data.resolvedAddress);    
    res.send(newData);
  } catch (err) {
    return next(err);
  }
})

router.get("/trips/:tripId/weather", async function (req, res, next) {
  const { tripId } = req.params;

  try {
    // Fetch trip details from DB
    const trip = await Trip.get(tripId);
    if (!trip) {
      throw new NotFoundError(`No trip found with ID: ${tripId}`);
    }

    const { location, start_date, end_date } = trip;

    // Fetch weather data for trip location and date range
    const response = await axios.get(`${API_BASE_URL}${location}/${start_date}/${end_date}?unitGroup=metric&key=${API_KEY}`);
    const data = response.data;

    const newData = repackageData(data);
    res.json(newData);
  } catch (err) {
    return next(err);
  }
});

// Fetches weather data based on trip and ensures proper weather association
router.get("/trips/:tripId/weather", async function (req, res, next) {
  const { tripId } = req.params;

  try {
      const trip = await Trip.get(tripId);
      if (!trip) {
          throw new NotFoundError(`No trip found for this trip`);
      }
      const newData = repackageData(data);
      res.send(newData)
  } catch(err) {
      res.error()
  }
})


module.exports = router;