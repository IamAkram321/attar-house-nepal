import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import ReCAPTCHA from 'react-google-recaptcha';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-url';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
const SHOW_CAPTCHA_AFTER_FAILURES = 2;

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const captchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "unconfigured") {
      toast({
        title: "Google sign-in isn't configured yet",
        description: "This backend has no OAuth keys. Use email sign-in, or add GOOGLE_CLIENT_ID/SECRET.",
        variant: "destructive",
      });
    }
    if (!isLoading && user) {
      const next = params.get("next");
      window.location.href = next && next.startsWith("/") ? next : isAdmin ? '/admin' : '/';
    }
  }, [isLoading, user, isAdmin]);

  const showCaptcha = failureCount >= SHOW_CAPTCHA_AFTER_FAILURES && !!RECAPTCHA_SITE_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const captchaToken = captchaRef.current?.getValue() || undefined;
      const baseUrl = API_URL.replace(/\/$/, '');

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFailureCount((c) => c + 1);
        captchaRef.current?.reset();
        toast({ title: data.error ?? 'Could not sign in', variant: 'destructive' });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      window.location.href = next && next.startsWith("/") ? next : isAdmin ? '/admin' : '/';
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    const baseUrl = API_URL.replace(/\/$/, '');
    window.location.href = `${baseUrl}/api/auth/google`;
  };

  const inputClasses =
    'w-full border border-border/80 bg-background/50 focus:bg-background pl-10 pr-10 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm placeholder:text-muted-foreground/50';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background pt-6 lg:pt-0">
      
      {/* Left Brand Showcase Section (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 bg-[#FAF8F5] border-r border-border/60 p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C5A265]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#C5A265]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Link */}
        <div className="relative z-10 pt-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>

        {/* Hero Branding Content */}
        <div className="relative z-10 max-w-md my-auto py-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/30 text-[#8C6D37] text-xs font-medium">
            <Sparkles className="w-3 h-3" /> Attar House Nepal
          </div>
          
          <h2 className="font-serif text-4xl xl:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Crafted for Olfactory Distinction
          </h2>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            Welcome back to Attar House Nepal. Access your private orders and discover new attar arrivals.
          </p>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Order tracking on attar dispatch</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>End-to-end encrypted patron profile management</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Priority concierge access for verified patrons</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Banner */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground/80 pb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with enterprise-grade SSL encryption</span>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="lg:col-span-7 xl:col-span-6 flex items-center justify-center p-6 sm:p-12 md:p-16 relative">
        
        {/* Mobile Header Link */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6 my-auto">
          
          {/* Logo & Headline Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/30 text-[#8C6D37] text-xs font-medium">
              <Sparkles className="w-3 h-3" /> Attar House Nepal
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account dashboard
            </p>
          </div>

          {/* Main Card Container */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/70 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Social OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-border/80 bg-background/80 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-[#C5A265]/10 hover:border-[#C5A265] disabled:opacity-60 shadow-sm"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Visual Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold">
                <span className="bg-card px-3 text-muted-foreground/70">Or sign in with email</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-foreground/80">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#C5A265] hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClasses}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Captcha Challenge */}
              {showCaptcha && (
                <div className="flex justify-center pt-2">
                  <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY!} />
                </div>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C5A265] text-neutral-900 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#B79A62] transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Signup Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account yet?{' '}
            <Link href="/signup" className="text-[#C5A265] hover:underline font-semibold">
              Create an account
            </Link>
          </p>

          {/* Terms & Policy Notice */}
          <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
            By accessing Attar House Nepal, you agree to our{' '}
            <Link href="/terms" className="text-[#C5A265] hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-[#C5A265] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}