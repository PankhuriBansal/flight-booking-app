import { Router } from "express";
import { pool, withTransaction } from "../db.js";
import type { Booking, NewBooking, BookingDetails } from "../types.js";
import { validateBody, requireId } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError, pgErrorCode } from "../errors.js";
import { parsePagination, buildMeta } from "../pagination.js";
import { bookingSchema } from "../schemas.js";

const router = Router();

// Booking + user + flight ki details ek saath (JOIN)
const DETAILS_SQL = `
  SELECT b.id AS booking_id, b.status, b.created_at AS booked_at,
         u.name AS user_name, u.email AS user_email,
         f.origin, f.destination, f.departure_time, f.price
  FROM bookings b
  JOIN users u ON b.user_id = u.id
  JOIN flights f ON b.flight_id = f.id
`;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePagination(req.query);

    const [countResult, dataResult] = await Promise.all([
      pool.query<{ total: number }>(
        "SELECT COUNT(*)::int AS total FROM bookings",
      ),
      pool.query<BookingDetails>(
        `${DETAILS_SQL} ORDER BY b.id LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
    ]);

    const total = countResult.rows[0]?.total ?? 0;
    res.json({ data: dataResult.rows, meta: buildMeta(page, limit, total) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);
    const result = await pool.query<BookingDetails>(
      `${DETAILS_SQL} WHERE b.id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      throw new HttpError(404, "Booking not found");
    }
    res.json(result.rows[0]);
  }),
);

router.post(
  "/",
  validateBody(bookingSchema),
  asyncHandler(async (req, res) => {
    const { user_id, flight_id } = req.body as NewBooking;

    const booking = await withTransaction(async (client) => {
      // Step 1: seat ghatao, sirf tab jab seat bachi ho (ek hi atomic statement)
      const seat = await client.query(
        "UPDATE flights SET seats_available = seats_available - 1 WHERE id = $1 AND seats_available > 0 RETURNING id",
        [flight_id],
      );

      if (seat.rows.length === 0) {
        // Ya to flight hai hi nahi, ya seats khatam
        const flight = await client.query(
          "SELECT id FROM flights WHERE id = $1",
          [flight_id],
        );
        if (flight.rows.length === 0) {
          throw new HttpError(404, "Flight not found");
        }
        throw new HttpError(409, "No seats available");
      }

      // Step 2: booking banao. Fail hui to upar ki seat bhi rollback ho jayegi
      try {
        const result = await client.query<Booking>(
          "INSERT INTO bookings (user_id, flight_id) VALUES ($1, $2) RETURNING *",
          [user_id, flight_id],
        );
        return result.rows[0];
      } catch (err) {
        if (pgErrorCode(err) === "23503") {
          throw new HttpError(404, "User does not exist");
        }
        throw err;
      }
    });

    res.status(201).json(booking);
  }),
);

router.patch(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);

    const cancelled = await withTransaction(async (client) => {
      // Sirf wahi booking cancel hogi jo abhi cancelled nahi hai (ek hi atomic statement)
      const result = await client.query<Booking>(
        "UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status <> 'cancelled' RETURNING *",
        [id],
      );

      const row = result.rows[0];
      if (!row) {
        const existing = await client.query(
          "SELECT id FROM bookings WHERE id = $1",
          [id],
        );
        if (existing.rows.length === 0) {
          throw new HttpError(404, "Booking not found");
        }
        throw new HttpError(409, "Booking already cancelled");
      }

      // Seat wapas karo
      await client.query(
        "UPDATE flights SET seats_available = seats_available + 1 WHERE id = $1",
        [row.flight_id],
      );

      return row;
    });

    res.json(cancelled);
  }),
);

export default router;
