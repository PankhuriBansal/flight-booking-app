# Flight Booking API

A REST API for managing users, flights and bookings, built with Node.js, Express, TypeScript and PostgreSQL.

## Tech stack
- Node.js, Express
- TypeScript (run with `tsx`)
- PostgreSQL (`pg` connection pool, parameterized queries)

## Features
- CRUD for users, flights and bookings
- Flight search with filters (`origin`, `destination`)
- Booking details via SQL JOINs (booking + user + flight)
- Soft cancel for bookings (status changes to `cancelled`, history is kept)
- Foreign key and unique constraint errors mapped to proper HTTP status codes (404, 409)

## Getting started

### 1. Clone and install
```bash
git clone https://github.com/PankhuriBansal/flight-booking-app.git
cd flight-booking-app
npm install
```

### 2. Set up the database
1. Create a PostgreSQL database named `flight_booking`.
2. Run `db/schema.sql` in pgAdmin's Query Tool (it creates the tables and inserts sample data).

### 3. Configure environment variables
Copy `.env.example` to `.env` and fill in your PostgreSQL password:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=flight_booking
```

### 4. Run
```bash
npm run dev
```
The server starts at `http://localhost:3000`.

## API endpoints

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get one user |
| POST | `/users` | Create a user (`name`, `email`) |
| PUT | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user (409 if the user has bookings) |
| GET | `/users/:id/bookings` | Bookings of a user, with flight details |

### Flights
| Method | Endpoint | Description |
|---|---|---|
| GET | `/flights` | List flights. Optional filters: `?origin=DEL&destination=BOM` |
| GET | `/flights/:id` | Get one flight |
| POST | `/flights` | Create a flight |
| PUT | `/flights/:id` | Update a flight |
| DELETE | `/flights/:id` | Delete a flight (409 if it has bookings) |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/bookings` | List bookings with user and flight details |
| GET | `/bookings/:id` | Get one booking |
| POST | `/bookings` | Create a booking (`user_id`, `flight_id`) |
| PATCH | `/bookings/:id/cancel` | Cancel a booking |

### Example request
```
POST /bookings
Content-Type: application/json

{ "user_id": 1, "flight_id": 2 }
```

## Status codes used
200 OK, 201 Created, 400 Bad Request, 404 Not Found, 409 Conflict, 500 Server Error

## Project structure
```
src/
  index.ts          app setup and routes
  db.ts             PostgreSQL connection pool
  types.ts          shared TypeScript types
  routes/
    users.ts
    flights.ts
    bookings.ts
db/
  schema.sql        tables and sample data
  queries.sql       practice SQL queries
docs/               API test collection (Thunder Client)
```

## Roadmap
- [ ] Input validation (Zod)
- [ ] Authentication (JWT)
- [ ] Next.js frontend
- [ ] Docker and CI/CD
- [ ] Deployment
- [ ] AI assistant (RAG)


