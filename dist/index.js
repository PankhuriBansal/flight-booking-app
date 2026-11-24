import express from "express";
import usersRouter from "./routes/users.js";
import flightsRouter from "./routes/flights.js";
import bookingsRouter from "./routes/bookings.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use("/users", usersRouter);
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use("/flights", flightsRouter);
app.use("/bookings", bookingsRouter);
app.use(notFound);
app.use(errorHandler);
app.get("/hello", (req, res) => {
    res.json({ message: "Hello from flight booking api" });
});
app.listen(PORT, () => {
    console.log("Server running on local host 3000");
});
//# sourceMappingURL=index.js.map