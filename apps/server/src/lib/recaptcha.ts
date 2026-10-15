const { RECAPTCHA_SECRET_KEY } = process.env;

if (!RECAPTCHA_SECRET_KEY) {
  console.warn(
    "[recaptcha] RECAPTCHA_SECRET_KEY not set. CAPTCHA checks will be skipped — " +
      "fine for local dev, but set this before going to production."
  );
}

/**
 * Verifies a Google reCAPTCHA v2 token server-side.
 *
 * SECURITY: this MUST happen server-side. A client-side-only "the widget
 * showed a checkmark" check proves nothing — a scripted attacker talking
 * directly to your API never renders the widget at all. The only trustworthy
 * signal is Google's siteverify endpoint confirming the token server-to-server.
 *
 * Returns true if verification is skipped (no secret configured, e.g. local
 * dev) so the auth flow doesn't hard-fail on machines without a key set up.
 */
export async function verifyCaptcha(token: string | undefined): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET_KEY, response: token }),
    });

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[recaptcha] Verification request failed", err);
    // Fail closed: if we can't confirm the CAPTCHA, treat it as failed
    // rather than silently letting the request through.
    return false;
  }
}