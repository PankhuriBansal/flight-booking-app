import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../db.js";
import type { User } from "../types.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError, pgErrorCode } from "../errors.js";
import { signUpSchema, loginSchema } from "../schemas.js";
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } from "../config.js";

// Schema se hi type nikalte hain, alag se likhna nahi padta
type SignupInput = z.infer<typeof signUpSchema>;
type LoginInput = z.infer<typeof loginSchema>;

const router = Router();

// Unknown email par bhi bcrypt chalane ke liye, taaki response time se email exist karta hai ya nahi pata na chale
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_ROUNDS);

function signToken(userId: number): string {
  return jwt.sign(
    {
      sub: String(userId),
    },
    JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: JWT_EXPIRES_IN,
    },
  );
}

router.post(
  "/signup",
  validateBody(signUpSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body as SignupInput;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
      const result = await pool.query<User>(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id , name, email, created_at",
        [name, email, passwordHash],
      );
      const user = result.rows[0];
      if (!user) {
        throw new Error("Signup insert returned no row");
      }
      res.status(201).json({ token: signToken(user.id), user });
    } catch (err) {
      if (pgErrorCode(err) === "23505") {
        throw new HttpError(409, "Email already exists");
      }
      throw err;
    }
  }),
);

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as LoginInput;

    const result = await pool.query<User & { password_hash: string | null }>(
      "SELECT id, name, email, created_at, password_hash FROM users WHERE email = $1",
      [email],
    );
    const row = result.rows[0];

    // User na mile ya password set na ho, tab bhi bcrypt chalao (time same rahe)
    const hashToCheck = row?.password_hash ?? DUMMY_HASH;
    const passwordOk = await bcrypt.compare(password, hashToCheck);

    if (!row || !row.password_hash || !passwordOk) {
      throw new HttpError(401, "Invalid email or password");
    }

    res.json({
      token: signToken(row.id),
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        created_at: row.created_at,
      },
    });
  }),
);

export default router;
