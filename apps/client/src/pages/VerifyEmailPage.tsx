import { Link } from 'wouter';
import BrandLogo from '@/components/common/BrandLogo';

export default function VerifyEmailPage() {
  const status = new URLSearchParams(window.location.search).get('status');
  const success = status === 'success';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center mb-8">
          <BrandLogo size="md" />
        </Link>

        {success ? (
          <>
            <h1 className="text-2xl font-serif text-foreground mb-4">Email Verified</h1>
            <p className="text-muted-foreground mb-8">
              Your patron profile has been confirmed. You may now enter your account.
            </p>
            <Link
              href="/login"
              className="inline-block bg-foreground text-background px-8 py-3 rounded-full text-xs font-mono uppercase tracking-widest hover:bg-primary transition-colors"
            >
              Sign In
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-serif text-foreground mb-4">Link Expired or Invalid</h1>
            <p className="text-muted-foreground mb-8">
              This verification link has expired. Please request a fresh invitation to access your account.
            </p>
            <Link href="/signup" className="text-xs font-mono uppercase tracking-widest text-primary hover:underline">
              Back to Registration
            </Link>
          </>
        )}
      </div>
    </div>
  );
}