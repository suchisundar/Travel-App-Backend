-- Drop tables if they already exist, cascading dependencies
DROP TABLE IF EXISTS packing_items CASCADE;
DROP TABLE IF EXISTS trip_activities CASCADE;
DROP TABLE IF EXISTS trip_dates CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- Create the trips table
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  location VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

-- Create the trip_dates table
CREATE TABLE trip_dates (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tempmax FLOAT,
  tempmin FLOAT,
  precipprob FLOAT,
  conditions VARCHAR(255),
  description TEXT,
  icon VARCHAR(50)
);

-- Create the trip_activities table
CREATE TABLE trip_activities (
  id SERIAL PRIMARY KEY,
  trip_date_id INTEGER REFERENCES trip_dates(id) ON DELETE CASCADE,
  description TEXT NOT NULL
);

-- Create the packing_items table
CREATE TABLE packing_items (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  packed BOOLEAN DEFAULT FALSE
);
