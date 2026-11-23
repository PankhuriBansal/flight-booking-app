import { Router } from "express";
import { pool } from "../db.js";
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

    try {
      const result = await pool.query<Booking>(
        "INSERT INTO bookings (user_id, flight_id) VALUES ($1, $2) RETURNING *",
        [user_id, flight_id],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (pgErrorCode(err) === "23503") {
        throw new HttpError(404, "User or flight does not exist");
      }
      throw err;
    }
  }),
);

router.patch(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);

    const existing = await pool.query<Booking>(
      "SELECT * FROM bookings WHERE id = $1",
      [id],
    );
    const booking = existing.rows[0];
    if (!booking) {
      throw new HttpError(404, "Booking not found");
    }
    if (booking.status === "cancelled") {
      throw new HttpError(409, "Booking already cancelled");
    }

    const result = await pool.query<Booking>(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [id],
    );
    res.json(result.rows[0]);
  }),
);

export default router;
