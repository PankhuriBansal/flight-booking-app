-- Tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  price NUMERIC(10,2) NOT NULL
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  flight_id INT REFERENCES flights(id),
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT now()
);

-- Dummy data
INSERT INTO users (name, email) VALUES
  ('Pankhuri', 'pankhuri@example.com'),
  ('Rahul', 'rahul@example.com'),
  ('Anita', 'anita@example.com');

INSERT INTO flights (origin, destination, departure_time, price) VALUES
  ('DEL', 'BOM', '2026-12-10 08:00', 4500),
  ('BLR', 'DEL', '2026-12-11 10:30', 5400),
  ('BLR', 'BOM', '2026-12-12 14:15', 5500),
  ('DEL', 'BLR', '2026-12-13 18:45', 6100);

INSERT INTO bookings (user_id, flight_id) VALUES
  (1, 1),
  (1, 3),
  (2, 2);