-- Migration: add is_admin column to users table
-- Run once on existing databases. Safe to run multiple times (idempotent).

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- To grant admin to an existing user, run:
-- UPDATE users SET is_admin = TRUE WHERE email = 'your-admin@email.com';
