
const express = require("express");
const { authAmadeus } = require("../utils/amadeusAuth");
const { ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

router.get("/activities/:city", ensureLoggedIn, async (req, res, next) => {
  try {
    const city = req.params.city;
    const token = await authAmadeus();

    const response = await axios.get(
      `https://test.api.amadeus.com/v1/shopping/activities?latitude=37.7749&longitude=-122.4194`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const activities = response.data.data.map(activity => ({
      id: activity.id,
      name: activity.name,
      description: activity.shortDescription,
      price: activity.price.amount,
    }));

    res.json({ activities });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
