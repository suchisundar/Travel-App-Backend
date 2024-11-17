
  "use strict";

const db = require("../db");
const axios = require("axios");
const { NotFoundError } = require("../expressError");

class Trip {
  /** Create a new trip */
  static async create({ userId, location, start_date, end_date }) {
    const result = await db.query(
      `INSERT INTO trips (user_id, location, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, location, start_date, end_date`,
      [userId, location, start_date, end_date]
    );
    return result.rows[0];
  }

  /** Get all trips for a user */

  static async getUserTrips(username) {
    const result = await db.query(
      `SELECT t.id, t.location, t.start_date, t.end_date
       FROM trips t
       JOIN users u ON t.user_id = u.id
       WHERE u.username = $1
       ORDER BY t.start_date`,
      [username]
    );
    return result.rows;
  }

  /**Get trip by ID */
  static async get(tripId) {
    const result = await db.query(
      `SELECT id, user_id, location, start_date, end_date
       FROM trips
       WHERE id = $1`,
      [tripId]
    );
  
    const trip = result.rows[0];
    if (!trip) throw new NotFoundError(`No trip with ID: ${tripId}`);
    return trip;
  }
  
 
/** Update trip location and/or dates */
static async updateTrip(tripId, location, start_date, end_date) {
  const result = await db.query(
    `UPDATE trips
     SET location = $1, start_date = $2, end_date = $3
     WHERE id = $4
     RETURNING id, location, start_date, end_date`,
    [location, start_date, end_date, tripId]
  );

  const trip = result.rows[0];
  if (!trip) throw new NotFoundError(`No trip with id: ${tripId}`);

  return trip;
}

  /** Add weather data dynamically from Visual Crossing */
  static async getWeather(location, startDate, endDate) {
    const apiKey = process.env.VISUALCROSSING_API_KEY;
    const response = await axios.get(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${startDate}/${endDate}`,
      {
        params: { key: apiKey, unitGroup: "us" },
      }
    );

    return response.data.days.map((day) => ({
      date: day.datetime,
      tempmax: day.tempmax,
      tempmin: day.tempmin,
      precipprob: day.precipprob,
      conditions: day.conditions,
      icon: day.icon,
    }));
  }

  /** Add weather data to the database */
  static async addWeather({ trip_id, date, tempmin, tempmax, precipprob, conditions, icon }) {
    const result = await db.query(
      `INSERT INTO trip_dates (trip_id, date, tempmin, tempmax, precipprob, conditions, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, trip_id, date, tempmin, tempmax, precipprob, conditions, icon`,
      [trip_id, date, tempmin, tempmax, precipprob, conditions, icon]
    );
    return result.rows[0];
  }

  /** Fetch all weather data for a trip */
  static async getWeatherForTrip(tripId) {
    const result = await db.query(
      `SELECT id, trip_id, date, tempmax, tempmin, precipprob, conditions, icon
       FROM trip_dates
       WHERE trip_id = $1
       ORDER BY date`,
      [tripId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`No weather data found for trip: ${tripId}`);
    }

    return result.rows;
  }

  /** Add a packing item to a trip */
  static async addPackingItem({ trip_id, item_name }) {
    const result = await db.query(
      `INSERT INTO packing_items (trip_id, item_name)
       VALUES ($1, $2)
       RETURNING id, trip_id, item_name, is_checked`,
      [trip_id, item_name]
    );
    return result.rows[0];
  }

  /** Get all packing items for a trip */
  static async getPackingItems(tripId) {
    const result = await db.query(
      `SELECT id, trip_id, item_name, is_checked
       FROM packing_items
       WHERE trip_id = $1`,
      [tripId]
    );
    return result.rows;
  }

  /** Update a packing item's checked status */
  static async updatePackingItemStatus(id, isChecked) {
    const result = await db.query(
      `UPDATE packing_items
       SET is_checked = $1
       WHERE id = $2
       RETURNING id, trip_id, item_name, is_checked`,
      [isChecked, id]
    );
    if (!result.rows[0]) {
      throw new NotFoundError(`No packing item with id: ${id}`);
    }
    return result.rows[0];
  }

  /** Delete a packing item */
  static async deletePackingItem(id) {
    const result = await db.query(
      `DELETE FROM packing_items
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    if (!result.rows[0]) {
      throw new NotFoundError(`No packing item with id: ${id}`);
    }
    return result.rows[0];
  }


  /** Add an activity to a trip */
  static async addActivity({ trip_id, date, description }) {
    const result = await db.query(
      `INSERT INTO trip_activities (trip_id, date, description)
       VALUES ($1, $2, $3)
       RETURNING id, trip_id, date, description`,
      [trip_id, date, description]
    );
    return result.rows[0];
  }
  

  /** Get all activities for a trip */
  static async getActivities(tripId) {
    const result = await db.query(
      `SELECT * FROM trip_activities WHERE trip_date_id = $1`,
      [tripId]
    );
    return result.rows;
  }

  /** Recommend packing items based on weather and activities */
  static getPackingRecommendations(weather, activities) {
    let items = [];

    if (weather.toLowerCase().includes("rain")) items.push("Raincoat", "Umbrella");
    if (weather.toLowerCase().includes("snow")) items.push("Gloves", "Boots", "Heavy Coat");

    if (activities.includes("hiking")) items.push("Hiking boots", "Bug spray");
    if (activities.includes("beach")) items.push("Swimsuit", "Sunscreen");

    return items;
  }
}

module.exports = Trip;

  
  