import { useLocation, Link } from 'wouter';

export default function PaymentFailedPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get('orderId');

  return (
    <div className="pt-36 pb-24 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h1 className="font-serif text-4xl mb-4">Payment Unsuccessful</h1>
      <p className="text-muted-foreground mb-2">
        We were unable to process your payment
        {orderId ? (
          <>
            {' '}
            for order <span className="font-medium text-foreground">#{orderId}</span>
          </>
        ) : (
          ''
        )}
        .
      </p>
      <p className="text-muted-foreground mb-8">
        Your order remains pending. You can try checking out again or select a different payment method.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/checkout"
          className="inline-block bg-foreground text-background px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-primary transition-colors"
        >
          Return to Checkout
        </Link>
        <Link
          href="/contact"
          className="inline-block border border-border px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-accent transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}