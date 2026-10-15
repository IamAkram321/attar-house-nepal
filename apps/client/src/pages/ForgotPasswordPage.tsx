import { useRef, useState } from 'react';
import { Link } from 'wouter';
import ReCAPTCHA from 'react-google-recaptcha';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-url';
import BrandLogo from '@/components/common/BrandLogo';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const captchaToken = captchaRef.current?.getValue();
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      toast({ title: 'Please complete the CAPTCHA', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken }),
      });
      // Always show the same confirmation, regardless of the response body —
      // this page never learns whether the email actually had an account.
      setSubmitted(true);
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="flex items-center justify-center mb-8">
          <BrandLogo size="md" />
        </Link>

        {submitted ? (
          <>
            <h1 className="text-2xl font-serif text-foreground mb-4">Check your email</h1>
            <p className="text-muted-foreground">
              If an account exists for that email, we've sent password reset instructions.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-serif text-foreground mb-2">Forgot password?</h1>
            <p className="text-muted-foreground mb-8">
              Enter your email and we'll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-card px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {RECAPTCHA_SITE_KEY && (
                <div className="flex justify-center pt-1">
                  <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY} />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-foreground text-background py-3 rounded-lg text-sm font-medium hover:bg-primary transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <Link href="/login" className="inline-block mt-8 text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}