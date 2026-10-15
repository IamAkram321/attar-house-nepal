import { useEffect, useState } from "react";
import { Link } from "wouter";
import { API_URL } from "@/lib/api-url";

export default function PaymentSuccessPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const gateway = searchParams.get("gateway");
  const orderId = searchParams.get("orderId");
  const isMock = searchParams.get("mock") === "true";
  const encodedData = searchParams.get("data");
  const pidx = searchParams.get("pidx");

  const [verifying, setVerifying] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (isMock) {
        setVerifying(false);
        return;
      }

      try {
        if (gateway === "esewa" && encodedData) {
          const res = await fetch(`${API_URL}/api/payment/esewa/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ encodedData }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "eSewa signature verification failed");
          }
        } else if (gateway === "khalti" && pidx) {
          const res = await fetch(`${API_URL}/api/payment/khalti/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pidx }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "Khalti payment verification failed");
          }
        }
      } catch {
        setError("Could not complete verification process with server");
      } finally {
        setVerifying(false);
      }
    }

    verifyPayment();
  }, [gateway, encodedData, pidx, isMock]);

  if (verifying) {
    return (
      <div className="pt-36 pb-24 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-3xl mb-4">Verifying Payment...</h1>
        <p className="text-muted-foreground">Please wait while we confirm your payment status.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-36 pb-24 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-4xl mb-4 text-destructive">Payment Verification Failed</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link
          href="/checkout"
          className="inline-block bg-foreground text-background px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-primary transition-colors"
        >
          Return to Checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-24 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-serif text-4xl mb-4 text-emerald-600">Payment Successful!</h1>
      <p className="text-muted-foreground mb-2">
        Thank you — your payment via <span className="uppercase font-medium">{gateway ?? "Online Payment"}</span> for order{" "}
        <span className="font-medium text-foreground">#{orderId}</span> has been processed.
      </p>
      <p className="text-muted-foreground mb-8">We are now preparing your items for delivery.</p>
      <Link
        href="/"
        className="inline-block bg-foreground text-background px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-primary transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}