-- Seats ka column. Purani rows ko 100 seats mil jaati hain
ALTER TABLE flights
  ADD COLUMN IF NOT EXISTS seats_available INT NOT NULL DEFAULT 100
  CHECK (seats_available >= 0);

-- Purani confirmed bookings ke hisaab se seats adjust karo (sirf ek baar chalao)
UPDATE flights f
SET seats_available = GREATEST(0, 100 - (
  SELECT COUNT(*) FROM bookings b
  WHERE b.flight_id = f.id AND b.status = 'confirmed'
));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings (flight_id);
CREATE INDEX IF NOT EXISTS idx_flights_route_time ON flights (origin, destination, departure_time);