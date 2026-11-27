import { z } from "zod";

const airportCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "must be a 3-letter airport code like DEL");

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "name must be atleast 2 characters")
    .max(100, "name must be at most 100 characters"),
  email: z.string().trim().toLowerCase().email("email is in valid"),
});

export const signUpSchema = userSchema.extend({
  password: z
    .string()
    .min(8, "password must be of 8 characters")
    .max(72, "password must be at most 72 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("email is invalid"),
  password: z
    .string()
    .min(1, "password is required")
    .max(72, "password must be at most 72 characters"),
});

export const flightSchema = z
  .object({
    origin: airportCode,
    destination: airportCode,
    departure_time: z
      .string()
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "departure_time must be a valid date-time, like 2026-12-20 09:30",
      ),
    price: z
      .number()
      .positive("price must be greater than 0")
      .max(1000000, "price is too large"),
  })
  .refine((flight) => flight.origin !== flight.destination, {
    message: "origin and destination must be different",
    path: ["destination"],
  });

export const bookingSchema = z.object({
  user_id: z.number().int().positive("user_id must be a positive number"),
  flight_id: z.number().int().positive("flight_id must be a positive number"),
});
