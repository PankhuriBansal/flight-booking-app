import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors.js";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  const type = (err as { type?: string }).type;
  if (type === "entity.parse.failed") {
    res.status(400).json({ message: "Request body is too large" });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Server error" });
}
