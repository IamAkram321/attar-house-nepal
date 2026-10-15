import bcrypt from "bcrypt";

// Cost factor 12 is a reasonable 2024+ default for bcrypt — high enough to
// be slow against brute force, low enough not to make login noticeably slow
// for real users. Revisit upward as hardware gets faster.
const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * A precomputed bcrypt hash of a random, never-used password.
 *
 * SECURITY: when login is attempted against an email that doesn't exist (or
 * an account that has no password set, e.g. Google-only), we still run
 * bcrypt.compare() against THIS hash instead of skipping the check. bcrypt's
 * compare time is a function of the hash's cost factor, not of anything
 * about the input — so comparing against a real hash of the same cost takes
 * the same wall-clock time whether the account exists or not. Skipping the
 * compare entirely for "no such user" would make that path measurably
 * faster than the "wrong password" path, letting an attacker enumerate
 * valid emails purely by timing the login endpoint.
 */
export const DUMMY_HASH_FOR_TIMING_SAFETY = bcrypt.hashSync(
  "this-is-not-a-real-password-just-for-constant-time-compares",
  SALT_ROUNDS
);

export function isPasswordStrongEnough(password: string): boolean {
  // Deliberately simple and honest with the user about the one rule that
  // matters most (length) rather than security-theater composition rules
  // (must contain a symbol, a digit, etc.) that mostly just make people
  // write passwords on sticky notes. NIST 800-63B recommends exactly this.
  return typeof password === "string" && password.length >= 8;
}