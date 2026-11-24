import { Router } from "express";
import { pool } from "../db.js";
import type { Flight, NewFlight } from "../types.js";
import { validateBody, requireId } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError, pgErrorCode } from "../errors.js";
import { parsePagination, buildMeta } from "../pagination.js";
import { flightSchema } from "../schemas.js";

const router = Router();


router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePagination(req.query);
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

    // Dono queries ek saath chalti hain: total count aur is page ki rows
    const [countResult, dataResult] = await Promise.all([
      pool.query<{ total: number }>(
        `SELECT COUNT(*)::int AS total FROM flights ${where}`,
        values,
      ),
      pool.query<Flight>(
        `SELECT * FROM flights ${where}
         ORDER BY departure_time, id
         LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, offset],
      ),
    ]);

    // bookings.ts
    const total = countResult.rows[0]?.total ?? 0;
    res.json({ data: dataResult.rows, meta: buildMeta(page, limit, total) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);
    const result = await pool.query<Flight>(
      "SELECT * FROM flights WHERE id = $1",
      [id],
    );
    if (result.rows.length === 0) {
      throw new HttpError(404, "Flight not found");
    }
    res.json(result.rows[0]);
  }),
);

router.post(
  "/",
  validateBody(flightSchema),
  asyncHandler(async (req, res) => {
    const { origin, destination, departure_time, price } =
      req.body as NewFlight;

    const result = await pool.query<Flight>(
      "INSERT INTO flights (origin, destination, departure_time, price) VALUES ($1, $2, $3, $4) RETURNING *",
      [origin, destination, departure_time, price],
    );
    res.status(201).json(result.rows[0]);
  }),
);

router.put(
  "/:id",
  validateBody(flightSchema),
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);
    const { origin, destination, departure_time, price } =
      req.body as NewFlight;

    const result = await pool.query<Flight>(
      "UPDATE flights SET origin = $1, destination = $2, departure_time = $3, price = $4 WHERE id = $5 RETURNING *",
      [origin, destination, departure_time, price, id],
    );
    if (result.rows.length === 0) {
      throw new HttpError(404, "Flight not found");
    }
    res.json(result.rows[0]);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireId(req.params.id);

    try {
      const result = await pool.query<Flight>(
        "DELETE FROM flights WHERE id = $1 RETURNING *",
        [id],
      );
      if (result.rows.length === 0) {
        throw new HttpError(404, "Flight not found");
      }
      res.json({ message: "Flight deleted", flight: result.rows[0] });
    } catch (err) {
      if (pgErrorCode(err) === "23503") {
        throw new HttpError(409, "Flight has bookings, cannot delete");
      }
      throw err;
    }
  }),
);

export default router;
