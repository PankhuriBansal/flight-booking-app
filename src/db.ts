import "dotenv/config";
import { Pool, types } from "pg";

// NUMERIC (price) ko number banane ke liye, Din 6 mein kaam aayega
types.setTypeParser(1700, (val: string) => parseFloat(val));

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
