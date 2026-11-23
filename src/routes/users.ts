import { Router } from "express";
import { pool } from "../db.js";
import type { User, NewUser, UserBooking } from "../types.js";
import { validateBody, requireId } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError, pgErrorCode } from "../errors.js";
import { userSchema } from "../schemas.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const result = await pool.query<User>("SELECT * FROM users ORDER BY id");
    res.json(result.rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);
    const result = await pool.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      throw new HttpError(404, "User not found");
    }
    res.json(result.rows[0]);
  })
);

router.post(
  "/",
  validateBody(userSchema),
  asyncHandler(async (req, res) => {
    const { name, email } = req.body as NewUser;

    try {
      const result = await pool.query<User>(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
        [name, email]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (pgErrorCode(err) === "23505") {
        throw new HttpError(409, "Email already exists");
      }
      throw err;
    }
  })
);

router.put(
  "/:id",
  validateBody(userSchema),
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);
    const { name, email } = req.body as NewUser;

    try {
      const result = await pool.query<User>(
        "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
        [name, email, id]
      );
      if (result.rows.length === 0) {
        throw new HttpError(404, "User not found");
      }
      res.json(result.rows[0]);
    } catch (err) {
      if (pgErrorCode(err) === "23505") {
        throw new HttpError(409, "Email already exists");
      }
      throw err;
    }
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);

    try {
      const result = await pool.query<User>(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.rows.length === 0) {
        throw new HttpError(404, "User not found");
      }
      res.json({ message: "User deleted", user: result.rows[0] });
    } catch (err) {
      if (pgErrorCode(err) === "23503") {
        throw new HttpError(409, "User has bookings, cannot delete");
      }
      throw err;
    }
  })
);

router.get(
  "/:id/bookings",
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);

    const user = await pool.query("SELECT id FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) {
      throw new HttpError(404, "User not found");
    }

    const result = await pool.query<UserBooking>(
      `SELECT b.id AS booking_id, b.status, b.created_at AS booked_at,
              f.origin, f.destination, f.departure_time, f.price
       FROM bookings b
       JOIN flights f ON b.flight_id = f.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  })
);

export default router;