export type Flight = {
  id: number;
  origin: string;
  destination: string;
  price: number;
};

export type NewFlight = Omit<Flight, "id">;
