-- Tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  seats_available INT NOT NULL DEFAULT 100 CHECK (seats_available >= 0)
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  flight_id INT REFERENCES flights(id),
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_bookings_user_id ON bookings (user_id);
CREATE INDEX idx_bookings_flight_id ON bookings (flight_id);
CREATE INDEX idx_flights_route_time ON flights(origin, destination, departure_time);

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


-- day 5 
-- 1
SELECT b.id, f.origin, f.destination, f.price
FROM bookings b
JOIN flights f ON b.flight_id = f.id
WHERE b.user_id = 1;

-- 2
SELECT * FROM flights
WHERE origin = 'DEL' AND destination = 'BOM'
ORDER BY price ASC;

-- 3
SELECT f.id, f.origin, f.destination, COUNT(b.id) AS times_booked
FROM flights f
LEFT JOIN bookings b ON b.flight_id = f.id
GROUP BY f.id, f.origin, f.destination;

-- 4
SELECT u.name, SUM(f.price) AS total_spent
FROM users u
JOIN bookings b ON b.user_id = u.id
JOIN flights f ON b.flight_id = f.id
GROUP BY u.id, u.name;

-- 5
SELECT u.name
FROM users u
LEFT JOIN bookings b ON b.user_id = u.id
WHERE b.id IS NULL;

