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
