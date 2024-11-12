-- Clear dependent tables first
DELETE FROM packing_items;
DELETE FROM trip_activities;
DELETE FROM trip_dates;
DELETE FROM trips;

-- Clear users table last to ensure dependencies are dropped first
DELETE FROM users;

-- Insert a user with a hashed password (matching test setup)
INSERT INTO users (id, username, password, first_name, last_name, email)
VALUES 
  (1, 'testuser', '$2b$12$1zGj5mEC7BkXCsSkZ3ySK..q.H7MhoZjwRtEQATeS4ALNK6WgAk9u', 'Test', 'User', 'test@example.com');

-- Insert a second user to test multiple user scenarios (optional)
INSERT INTO users (id, username, password, first_name, last_name, email)
VALUES 
  (2, 'seconduser', '$2b$12$1zGj5mEC7BkXCsSkZ3ySK..q.H7MhoZjwRtEQATeS4ALNK6WgAk9u', 'Second', 'User', 'second@example.com');

-- Insert a sample trip for the first user
INSERT INTO trips (id, user_id, location, start_date, end_date)
VALUES 
  (1, 1, 'San Francisco', '2024-11-05', '2024-11-07');

-- Insert a second sample trip for testing edge cases (optional)
INSERT INTO trips (id, user_id, location, start_date, end_date)
VALUES 
  (2, 1, 'Berlin', '2024-12-01', '2024-12-05');

-- Insert sample dates with weather data for the first trip
INSERT INTO trip_dates (id, trip_id, date, tempmax, tempmin, precipprob)
VALUES
  (1, 1, '2024-11-05', 65.0, 50.8, 2.0),
  (2, 1, '2024-11-06', 68.0, 52.1, 15.0),
  (3, 1, '2024-11-07', 63.5, 48.5, 25.0);

-- Insert sample activities for specific dates in the first trip
INSERT INTO trip_activities (id, trip_date_id, description)
VALUES
  (1, 1, 'Visit Golden Gate Bridge'),
  (2, 2, 'Explore Fisherman''s Wharf'),
  (3, 3, 'Tour Alcatraz Island');

-- Optional: Insert packing list items for testing packing list endpoints
INSERT INTO packing_items (id, trip_id, item, category)
VALUES
  (1, 1, 'Raincoat', 'clothing'),
  (2, 1, 'Sunscreen', 'toiletries');
