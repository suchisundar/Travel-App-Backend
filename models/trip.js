"use strict";

const db = require("../db");

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


  /** Get trip by ID */
  static async get(id) {
    const result = await db.query(
      `SELECT * FROM trips WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /** Add an activity to a trip */
  static async addActivity({ trip_id, date, description }) {
    const result = await db.query(
      `INSERT INTO trip_activities (trip_date_id, description)
       VALUES ($1, $2)
       RETURNING id, trip_date_id, description`,
      [trip_id, description]
    );
    return result.rows[0];
  }

  /** Add weather data to a trip */
  static async addWeather({ trip_id, date, tempmin, tempmax, precipprob, conditions }) {
    const result = await db.query(
      `INSERT INTO trip_dates (trip_id, date, tempmin, tempmax, precipprob, conditions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, trip_id, date, tempmin, tempmax, precipprob, conditions`,
      [trip_id, date, tempmin, tempmax, precipprob, conditions]
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
    if (weather.toLowerCase().includes("snow")) items.push("Gloves", "Boots", "Heavy Coat", "Extra socks");

    if (activities.includes("hiking")) items.push("Hiking boots", "Bug spray");
    if (activities.includes("beach")) items.push("Swimsuit", "Sunscreen", "Towel");

    return items;
  }
}



module.exports = Trip;
