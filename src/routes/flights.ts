import { Router } from "express";
import type { Request, Response } from "express";

import { pool } from "../db.js";
import type { Flight, NewFlight } from "../types.js";

const router = Router();

function validateFlight(body: Partial<NewFlight>): string | null {
  const { origin, destination, departure_time, price } = body;

  if (
    typeof origin !== "string" ||
    typeof destination !== "string" ||
    typeof departure_time !== "string" ||
    price === undefined
  ) {
    return "origin, destination, departure_time and prices are required";
  }
  if (typeof price !== "number" || price <= 0) {
    return "price must be a positive number";
  }
  if (Number.isNaN(Date.parse(departure_time))) {
    return "Departure time is invalid";
  }
  if (origin.trim().toUpperCase() === destination.trim().toUpperCase()) {
    return "origin and destination must be different";
  }
  return null;
}

router.get("/", async (req: Request, res: Response) => {
  const { origin, destination } = req.query;
  const conditions: string[] = [];
  const values: string[] = [];

  if (typeof origin === "string") {
    values.push(origin.trim().toUpperCase());
    conditions.push(`origin = $${values.length}`);
  }
  if (typeof destination === "string") {
    values.push(destination.trim().toUpperCase());
    conditions.push(`destination = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query<Flight>(
      `SELECT * FROM flights ${where} ORDER BY departure_time`,
      values,
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
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  try {
    const result = await pool.query<Flight>(
      "SELECT * FROM flights WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Flight not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const error = validateFlight(req.body as Partial<NewFlight>);
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const { origin, destination, departure_time, price } = req.body as NewFlight;

  try {
    const result = await pool.query<Flight>(
      "INSERT INTO flights (origin, destination, departure_time, price) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        origin.trim().toUpperCase(),
        destination.trim().toUpperCase(),
        departure_time,
        price,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const error = validateFlight(req.body as Partial<NewFlight>);
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const { origin, destination, departure_time, price } = req.body as NewFlight;

  try {
    const result = await pool.query<Flight>(
      "UPDATE flights SET origin=$1, destination = $2, departure_time=$3,price=$4  WHERE id=$5 RETURNING *",
      [
        origin.trim().toUpperCase(),
        destination.trim().toUpperCase(),
        departure_time,
        price,
        id,
      ],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Flight not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
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
    const result = await pool.query<Flight>(
      "DELETE FROM flights WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Flight not found" });
      return;
    }
    res.json({ message: "Flight deleted", flight: result.rows[0] });
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23503") {
      res.status(409).json({ message: "Flights has bookings, cannot delete" });
      return;
    }
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
