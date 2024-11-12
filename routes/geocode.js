const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/translate/:location", async (req, res, next) => {
  try {
    const location = req.params.location;
    const response = await axios.get(
      `https://api.visualcrossing.com/translation/v1/geocode/${location}?key=${process.env.VISUALCROSSING_API_KEY}`
    );

    const { latitude, longitude } = response.data.location;

    return res.json({ latitude, longitude });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
