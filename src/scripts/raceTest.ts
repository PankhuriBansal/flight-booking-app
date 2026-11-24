export {};

const BASE_URL = "http://localhost:3000";

async function book(userId: number, flightId: number): Promise<number> {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ user_id: userId, flight_id: flightId }),
  });
  return res.status;
}

async function main(): Promise<void> {
  const flightId = 4;
  const attempts = 10;

  const statuses = await Promise.all(
    Array.from({ length: attempts }, () => book(1, flightId)),
  );

  const created = statuses.filter((s) => s === 201).length;
  const rejected = statuses.filter((s) => s === 409).length;
  console.log("Statuses:", statuses);
  console.log(`Created: ${created}, Rejected (no seats): ${rejected}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
