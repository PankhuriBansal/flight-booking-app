import express from "express";
import type { Request, Response, NextFunction } from "express";

import usersRouter from "./routes/users.js";
import flightsRouter from "./routes/flights.js";
import bookingsRouter from "./routes/bookings.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello from flight booking api" });
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/flights", flightsRouter);
app.use("/bookings", bookingsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// { "name": "Test Two", "email": "Test2@Example.com", "password": "secret1234" }

// { "name": "Test second", "email": "Testpankhuri@Example.com", "password": "secret1234" }