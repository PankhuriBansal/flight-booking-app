-- Purane sample users ke paas password nahi hai, isliye NULL allowed hai
ALTER TABLE users COLUMN IF NOT EXISTS password_hash TEXT