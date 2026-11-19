import express from "express";
import type { Request, Response, NextFunction } from "express";

import usersRouter from "./routes/users.js";
import flightsRouter from "./routes/flights.js";
import bookingsRouter from "./routes/bookings.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/users", usersRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/flights", flightsRouter);
app.use("/bookings", bookingsRouter);

app.get("/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello from flight booking api" });
});

app.listen(PORT, () => {
  console.log("Server running on local host 3000");
});
