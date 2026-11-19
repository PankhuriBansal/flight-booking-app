import { Router } from "express";
import type { Request, Response } from "express";

import { pool } from "../db.js";
import type { User, NewUser, UserBooking } from "../types.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query<User>("SELECT * FROM users ORDER BY id");
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
    const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { name, email } = req.body as Partial<NewUser>;
  if (!name || !email) {
    res.status(400).json({ message: "name and email are required" });
    return;
  }

  try {
    const result = await pool.query<User>(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23505") {
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const { name, email } = req.body as Partial<NewUser>;
  if (!name || !email) {
    res.status(400).json({ message: "name and email are required" });
    return;
  }

  try {
    const result = await pool.query<User>(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23505") {
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  try {
    const result = await pool.query<User>(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23503") {
      res.status(409).json({ message: "User has bookings, cannot delete" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/bookings", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  try {
    const user = await pool.query("SELECT id FROM users WHERE id=$1", [id]);
    if (user.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
    }
    const result = await pool.query<UserBooking>(
      `SELECT b.id AS booking_id, b.status, b.created_at AS booked_at, f.origin, f.destination, f.departure_time,f.price
        FROM bookings b
        JOIN flights f ON b.flight_id = f.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
        `,
      [id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
