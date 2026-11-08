const message: string = "hello typescript";
console.log(message);

let airline: string = "Indigo";
let seats: number = 180;
let isDelayed: boolean = false;

const prices: number[] = [4500, 5200, 3900];
const cities: string[] = ["Delhi", "Mumbai"];

type Flight = {
  id: number;
  origin: string;
  destination: string;
  price: number;
  stops?: number;
};

type BookingStatus = "confirmed" | "cancelled" | "pending";

type Booking = {
  id: number;
  flightId: number;
  status: BookingStatus;
};

const flights: Flight[] = [
  { id: 1, origin: "DEL", destination: "BOM", price: 4500 },
  { id: 2, origin: "DEL", destination: "BLR", price: 5200, stops: 1 },
  { id: 3, origin: "BOM", destination: "DEL", price: 3900 },
  { id: 4, origin: "DEL", destination: "BOM", price: 6100 },
];

function formatPrice(price: number) {
  return "${price}";
}

function filterByDestination(list: Flight[], destination: string): Flight[] {
  return list.filter((f) => f.destination === destination);
}

function getCheapest(list: Flight[]): Flight | undefined {
  if (list.length === 0) return undefined;
  return list.reduce((min, f) => (f.price < min.price ? f : min));
}

const booking: Booking = { id: 1, flightId: 2, status: "confirmed" };

console.log(filterByDestination(flights, "BOM"));

console.log(formatPrice(getCheapest(flights)?.price ?? 0));

console.log(booking);
