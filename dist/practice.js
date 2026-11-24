const message = "hello typescript";
console.log(message);
let airline = "Indigo";
let seats = 180;
let isDelayed = false;
const prices = [4500, 5200, 3900];
const cities = ["Delhi", "Mumbai"];
const flights = [
    { id: 1, origin: "DEL", destination: "BOM", price: 4500 },
    { id: 2, origin: "DEL", destination: "BLR", price: 5200, stops: 1 },
    { id: 3, origin: "BOM", destination: "DEL", price: 3900 },
    { id: 4, origin: "DEL", destination: "BOM", price: 6100 },
];
function formatPrice(price) {
    return "${price}";
}
function filterByDestination(list, destination) {
    return list.filter((f) => f.destination === destination);
}
function getCheapest(list) {
    if (list.length === 0)
        return undefined;
    return list.reduce((min, f) => (f.price < min.price ? f : min));
}
const booking = { id: 1, flightId: 2, status: "confirmed" };
console.log(filterByDestination(flights, "BOM"));
console.log(formatPrice(getCheapest(flights)?.price ?? 0));
console.log(booking);
export {};
//# sourceMappingURL=practice.js.map