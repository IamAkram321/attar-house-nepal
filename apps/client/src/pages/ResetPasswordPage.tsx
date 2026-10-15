import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-url';
import BrandLogo from '@/components/common/BrandLogo';

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const token = new URLSearchParams(window.location.search).get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.error ?? 'Could not reset password', variant: 'destructive' });
        return;
      }

      setSuccess(true);
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-serif text-foreground mb-4">Invalid link</h1>
          <p className="text-muted-foreground mb-8">
            This password reset link is missing or malformed. Please request a new one.
          </p>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-serif text-foreground mb-4">Password reset</h1>
          <p className="text-muted-foreground mb-8">
            Your password has been changed. You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-block bg-foreground text-background px-8 py-3 rounded-lg text-sm font-medium hover:bg-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center mb-8">
          <BrandLogo size="md" />
        </Link>

        <h1 className="text-3xl font-serif text-foreground mb-2 text-center">Reset your password</h1>
        <p className="text-muted-foreground mb-8 text-center">Choose a new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-card px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-border bg-card px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-background py-3 rounded-lg text-sm font-medium hover:bg-primary transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}