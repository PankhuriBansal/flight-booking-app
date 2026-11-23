import type { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import { HttpError } from "../errors.js";

// Body ko schema se check karta hai. Galat ho to 400, sahi ho to saaf data req.body mein rakhke aage bhejta hai
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

const idSchema = z.coerce.number().int().positive();

// "5" -> 5. "abc", "0", "-1", "1.5" -> null
export function parseId(value: unknown): number | null {
  const result = idSchema.safeParse(value);
  return result.success ? result.data : null;
}

// Id galat ho to seedha 400 throw karta hai, routes mein if likhne ki zaroorat nahi
export function requireId(value: unknown): number {
  const id = parseId(value);
  if (id === null) {
    throw new HttpError(400, "Invalid id");
  }
  return id;
}
