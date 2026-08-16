// bcryptjs (pure JS, no native binding) instead of bcrypt — the native
// module's compiled binary reliably breaks in Vercel's serverless bundle,
// which was the actual cause of the 500 on login. Hash format is identical,
// so existing bcrypt-hashed passwords keep working.
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Deterministic hash for refresh tokens so we can look them up by value in the
 * database (bcrypt's random salt would make that impossible). The token
 * itself is a long random JWT, so a fast, deterministic hash is safe here.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
