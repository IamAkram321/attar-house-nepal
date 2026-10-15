import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-url';
import { Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function SignupPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = isAdmin ? '/admin' : '/';
    }
  }, [isLoading, user, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: 'destructive' });
      return;
    }

    const captchaToken = captchaRef.current?.getValue();
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      toast({ title: 'Please complete the CAPTCHA', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, captchaToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        captchaRef.current?.reset();
        toast({ title: data.error ?? 'Could not create account', variant: 'destructive' });
        return;
      }

      setSubmitted(true);
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center bg-card border border-border p-8 rounded-2xl shadow-xl space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Check your inbox</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              If that email address is available, we've sent instructions to confirm your account. Follow the link inside to finish setup.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-all shadow-md gap-2"
          >
            Back to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Column: Brand & Visual Panel (Hidden on small screens) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-muted/40 border-r border-border p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/">
            <BrandLogo size="md" />
          </Link>
        </div>

        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <h2 className="text-4xl font-serif font-normal tracking-tight text-foreground leading-tight">
            Composing pure attars & oriental heirlooms.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed font-light">
            Create an account to preserve your private preferences, track orders, and discover new attars.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Real-time tracking on flacon curing & dispatch</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Dedicated private concierge for attar guidance</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Encrypted patron vault & private formula archive</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Protected by reCAPTCHA and end-to-end security</span>
        </div>
      </div>

      {/* Right Column: Interactive Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link href="/">
              <BrandLogo size="md" />
            </Link>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-serif font-normal tracking-tight text-foreground">Create an account</h1>
            <p className="text-muted-foreground text-sm font-light">
              Join Attar House Nepal to access new arrivals and tester-wall previews.
            </p>
          </div>

          {/* Social Sign In */}
          <button
            type="button"
            onClick={() => {
              window.location.href = `${API_URL}/api/auth/google`;
            }}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-muted-foreground/30 shadow-sm"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="bg-background px-4 text-xs uppercase tracking-wider text-muted-foreground absolute">
              Or continue with email
            </span>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border bg-card px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-card px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border bg-card pl-4 pr-10 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-border bg-card pl-4 pr-10 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {RECAPTCHA_SITE_KEY && (
              <div className="flex justify-center pt-2">
                <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY} />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}