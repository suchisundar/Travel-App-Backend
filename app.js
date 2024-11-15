"use strict";

/** Express app for weather app. */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const User = require("./models/user");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const tripsRoutes = require("./routes/trips"); 
const activitiesRoutes = require("./routes/activities");
const geocodeRoutes = require("./routes/geocode");
const apiRoutes = require("./routes/api");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);


app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/trips", tripsRoutes); 
app.use("/activities", activitiesRoutes); 
app.use("/geocode", geocodeRoutes); 
app.use("/api", apiRoutes);

/** Handle 404 errors -- this matches everything */
// app.use(function (req, res, next) {
//   return next(new NotFoundError());
// });

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
