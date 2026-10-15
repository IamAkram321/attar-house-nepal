import crypto from "node:crypto";

/**
 * Generates a cryptographically random token (256 bits of entropy) suitable
 * for email verification or password reset links.
 *
 * SECURITY: uses crypto.randomBytes (CSPRNG), never Math.random() — the
 * latter is not cryptographically secure and its output can be predicted,
 * which would make reset tokens guessable.
 */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hashes a raw token for storage. We store ONLY this hash in the database —
 * never the raw token — so that a database leak (backup, replica, an
 * over-broad log statement, a compromised admin panel, etc.) does not hand
 * over working password-reset or email-verification links. SHA-256 is
 * appropriate here (unlike for passwords): the token itself already has 256
 * bits of entropy from a CSPRNG, so there's no need for a slow KDF — the
 * attack this defends against is "did the raw token leak", not "can this be
 * brute-forced from a weak input space".
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function tokenExpiryDate(hoursFromNow: number): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}