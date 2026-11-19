import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
// import { Flight, NewFlight } from "./types";
import usersRouter from "./routes/users";
import flightsRouter from "./routes/flights";
import bookingsRouter from "./routes/bookings";

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
