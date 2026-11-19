export type Flight = {
  id: number;
  origin: string;
  destination: string;
  price: number;
};

export type NewFlight = Omit<Flight, "id">;

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: Date;
};

export type NewUser = Pick<User, "name" | "email">;

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: Date;
};

export type NewUser = Pick<User, "name" | "email">;

export type Flight = {
  id: number;
  origin: string;
  destination: string;
  departure_time: Date;
  price: number;
};

// Body mein departure_time string aati hai ("2026-12-20 09:30")
export type NewFlight = {
  origin: string;
  destination: string;
  departure_time: string;
  price: number;
};

export type BookingStatus = "confirmed" | "cancelled" | "pending";

export type Booking = {
  id: number;
  user_id: number;
  flight_id: number;
  status: BookingStatus;
  created_at: Date;
};

export type NewBooking = Pick<Booking, "user_id" | "flight_id">;

export type BookingDetails = {
  booking_id: number;
  status: BookingStatus;
  booked_at: Date;
  user_name: string;
  user_email: string;
  origin: string;
  destination: string;
  departure_time: Date;
  price: number;
};

export type UserBooking = Omit<BookingDetails, "user_name" | "user_email">;
