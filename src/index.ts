import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { Flight, NewFlight } from "./types";

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

const flights: Flight[] = [
  { id: 1, origin: "DEL", destination: "BOM", price: 4500 },
  { id: 2, origin: "BLR", destination: "DEL", price: 5400 },
  { id: 3, origin: "BLR", destination: "BOM", price: 5500 },
];

app.get("/flights", (req: Request, res: Response) => {
  // res.json(flights)
  const { origin, destination } = req.query;
  let result = flights;
  if (typeof origin === "string") {
    result = result.filter((f) => f.origin === origin);
    // return res.json(filteredOrigin);
  }

  if (typeof destination === "string") {
    result = result.filter((f) => f.destination === destination);
    // return res.json(filtered);
  }

  res.json(result);
});

app.get("/flights/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const flight = flights.find((f) => f.id === id);

  if (!flight) {
    return res.status(404).json({ message: "Flight not found" });
  }
  res.json(flight);
});

app.post("/flights", (req: Request, res: Response) => {
  const body = req.body as NewFlight;
  if (!body.origin || !body.destination || !body.price === undefined) {
    return res
      .status(400)
      .json({ message: "origin, destination and price are required" });
  }

  const newFlight: Flight = {
    id: flights.length + 1,
    origin: body.origin,
    destination: body.destination,
    price: body.price,
  };
  flights.push(newFlight);
  res.status(201).json(newFlight);
});

//fn to delete the entry on basis of id
app.delete("/flights/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Flight not found" });
  }
  const [deleted] = flights.splice(index, 1);
  res.json({ message: "Flight deleted", flight: deleted });
});

//fn to update the already present entry
app.post("/flights/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.json(404).json({ message: "Flight not found" });
  }

  const body = req.body as NewFlight;

  if (!body.origin || !body.destination || body.price === undefined) {
    return res.status(400).json({
      message: "origin, destination and price updated",
    });
  }
  const updated: Flight = {
    id,
    origin: body.origin,
    destination: body.destination,
    price: body.price,
  };
  flights[index] = updated;
  res.json(updated);
});

app.listen(PORT, () => {
  console.log("Server running on local host 3000");
});
