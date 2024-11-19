require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;
const API_BASE_URL = process.env.VISUALCROSSING_API_BASE_URL || "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const API_KEY = process.env.VISUALCROSSING_API_KEY;
const BASE_URL = process.env.BASE_URL || "http://localhost:3001"; 

const DB_USER = process.env.DB_USER || "suchi";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.NODE_ENV === "test" ? "tripplanner_test" : "tripplanner";

const BCRYPT_WORK_FACTOR = 12;

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

function getDatabaseUri() {
  return `postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

module.exports = {
  SECRET_KEY,
  PORT,
  API_BASE_URL,
  API_KEY,
  BASE_URL,
  getDatabaseUri,
  AMADEUS_API_KEY,
  AMADEUS_API_SECRET,
  BCRYPT_WORK_FACTOR,
};
