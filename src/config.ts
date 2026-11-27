import "dotenv/config";

const secret = process.env.JWT_SECRET;

// Secret na ho ya chhota ho to server start hi na ho (fail fast)
if (!secret || secret.length < 32) {
  throw new Error(
    "JWT_SECRET must be set in .env and be at least 32 characters long",
  );
}

export const JWT_SECRET: string = secret;
export const JWT_EXPIRES_IN = "1h";
export const BCRYPT_ROUNDS = 12;
