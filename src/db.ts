import "dotenv/config";
import { Pool, types } from "pg";

// 1700 = NUMERIC ka type id. Isse price number ban ke aayega, string nahi
types.setTypeParser(1700, (val: string) => parseFloat(val));

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});