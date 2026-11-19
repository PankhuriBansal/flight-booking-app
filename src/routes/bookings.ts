import { Router } from "express";
import type { Request, Response } from "express";

import { pool } from "../db.js";
import type { Booking, NewBooking, BookingDetails } from "../types.js";

const router = Router();

const DETAILS_SQL = `
SELECT b.id AS booking_id, b.status, b.created_at AS booked_at,
    u.name AS user_name, u.email AS user_email,
    f.origin, f.destination, f.departure_time, f.price
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN flights f ON b.flight_id = f.id
`;

router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query<BookingDetails>(
      `${DETAILS_SQL} ORDER BY b.id`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  try {
    const result = await pool.query<BookingDetails>(
      `${DETAILS_SQL} WHERE b.id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { user_id, flight_id } = req.body as Partial<NewBooking>;

  if (!Number.isInteger(user_id) || !Number.isInteger(flight_id)) {
    res.status(400).json({ message: "user_id and flight_id must be integers" });
    return;
  }

  try {
    const result = await pool.query<Booking>(
      "INSERT INTO bookings (user_id, flight_id) VALUES ($1, $2) RETURNING *",
      [user_id, flight_id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23503") {
      res.status(404).json({ message: "User or flight does not exist" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/cancel", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  try {
    const existing = await pool.query<Booking>(
      "SELECT * FROM bookings WHERE id = $1",
      [id],
    );
    if (existing.rows.length === 0) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (existing.rows[0]?.status === "cancelled") {
      res.status(404).json({ message: "Booking already cancelled" });
      return;
    }

    const result = await pool.query<Booking>(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [id],
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
