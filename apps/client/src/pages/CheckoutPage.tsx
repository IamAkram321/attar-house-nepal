import { useState } from 'react';
import { Link } from 'wouter';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Info,
  Upload,
  Check
} from 'lucide-react';
import { useGetCart } from '@workspace/api-client-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-url';
import { ATTAR_SHIPPING_ZONES, quoteShipping, PAYMENT_GUIDE } from '@/lib/attar-shipping';

type PaymentMethod = 'cash_on_delivery' | 'esewa' | 'khalti' | 'qr';

interface QrData {
  orderId: number;
  amount: number;
  qrImageUrl: string;
  accountName: string;
  instructions: string;
}

export default function CheckoutPage() {
  const { refreshCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: cart, isLoading } = useGetCart({
    query: { queryKey: ['cart'] },
  });

  const [form, setForm] = useState({
    customerName: user?.name ?? '',
    customerEmail: user?.email ?? '',
    customerPhone: '',
    shippingAddress: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [shippingZone, setShippingZone] = useState<string>('valley');
  const [transactionId, setTransactionId] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{ id: number; method: PaymentMethod } | null>(null);
  const [qrModalData, setQrModalData] = useState<QrData | null>(null);

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File size must be under 5MB', variant: 'destructive' });
        return;
      }
      setPaymentProof(file);
    }
  };

  const submitEsewaForm = (url: string, formData: Record<string, string>) => {
    const formEl = document.createElement('form');
    formEl.method = 'POST';
    formEl.action = url;

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      formEl.appendChild(input);
    });

    document.body.appendChild(formEl);
    formEl.submit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for Mandatory QR Fields
    if (paymentMethod === 'qr') {
      if (!transactionId.trim()) {
        toast({
          title: 'Transaction ID Required',
          description: 'Please enter your payment reference or transaction number.',
          variant: 'destructive',
        });
        return;
      }
      if (!paymentProof) {
        toast({
          title: 'Payment Screenshot Required',
          description: 'Please upload a screenshot of your completed payment.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let res: Response;

      // Shipping is estimate-only (backend totals cart items). Append zone to notes for concierge.
      const subtotalNow = cart?.subtotal ?? 0;
      const ship = quoteShipping(shippingZone, subtotalNow);
      const notesWithShipping = `${form.notes ?? ""}\n[Shipping zone: ${shippingZone} — ${ship.note}]`.trim();

      // Send multipart/form-data if QR code payment is selected
      if (paymentMethod === 'qr' && paymentProof) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => formData.append(key, val));
        formData.append('notes', notesWithShipping);
        formData.append('paymentMethod', paymentMethod);
        formData.append('transactionId', transactionId.trim());
        formData.append('paymentProof', paymentProof);

        res = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } else {
        res = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...form,
            notes: notesWithShipping,
            paymentMethod,
          }),
        });
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({ title: data.error ?? `Server error (${res.status})`, variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      refreshCart();

      if (paymentMethod === 'cash_on_delivery' || paymentMethod === 'qr') {
        setOrderPlaced({ id: data.id, method: paymentMethod });
      } else if (paymentMethod === 'esewa') {
        const esewaRes = await fetch(`${API_URL}/api/payment/esewa/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ orderId: data.id, amount: data.total }),
        });

        const esewaData = await esewaRes.json().catch(() => ({}));

        if (!esewaRes.ok) {
          toast({ title: esewaData.error ?? 'Failed to initiate eSewa payment', variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }

        if (esewaData.isMock && esewaData.redirectUrl) {
          window.location.href = esewaData.redirectUrl;
          return;
        }

        if (esewaData.esewaUrl && esewaData.formData) {
          submitEsewaForm(esewaData.esewaUrl, esewaData.formData);
        }
      } else if (paymentMethod === 'khalti') {
        const khaltiRes = await fetch(`${API_URL}/api/payment/khalti/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId: data.id,
            amount: data.total,
            customerName: form.customerName,
            customerEmail: form.customerEmail,
            customerPhone: form.customerPhone,
          }),
        });

        const khaltiData = await khaltiRes.json().catch(() => ({}));

        if (khaltiRes.ok && khaltiData.paymentUrl) {
          window.location.href = khaltiData.paymentUrl;
        } else {
          toast({ title: khaltiData.error ?? 'Failed to launch Khalti payment', variant: 'destructive' });
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      console.error('[Checkout Error Details]:', err);
      toast({
        title: 'Network or Server Error',
        description: err?.message || 'Check browser console and backend terminal logs.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="pt-36 pb-20 min-h-[80vh] flex flex-col items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full text-center bg-card border border-border p-8 rounded-2xl shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass-deep font-semibold">Order Registered</span>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground mt-1">Commission Entrusted</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Order Reference: <span className="font-semibold text-foreground">#{orderPlaced.id}</span>
            </p>
          </div>
          <div className="bg-muted/50 p-5 rounded-2xl text-xs text-muted-foreground leading-relaxed text-left space-y-2.5 border border-border/50">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <Sparkles className="w-4 h-4 text-primary" /> What happens next?
            </p>
            <p>
              {orderPlaced.method === 'cash_on_delivery'
                ? 'Your flacon is being prepared in our climate vault. Our private concierge will be in touch via email or phone to confirm exact delivery timing.'
                : 'Your payment verification details have been received. Our concierge will verify the deposit and prepare your numbered flacons for white-glove dispatch.'}
            </p>
          </div>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded-full font-mono text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-md"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-36 pb-24 min-h-screen container mx-auto px-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground font-medium text-sm">
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Preparing checkout...
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-20 min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
          Explore our collection and add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  const inputClasses =
    'w-full border border-border bg-background/50 focus:bg-background rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm placeholder:text-muted-foreground/60';

  return (
    <div className="pt-36 pb-20 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header section */}
        <div className="mb-8 border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Checkout</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> Secure SSL Encrypted Checkout
            </p>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Main Form Section */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">

            {/* Step 1: Customer Info */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <span className="w-7 h-7 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                <h2 className="text-base font-semibold text-foreground tracking-wide uppercase">
                  Shipping & Contact Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2 text-foreground/80">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.customerName}
                    onChange={handleChange('customerName')}
                    className={inputClasses}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2 text-foreground/80">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.customerEmail}
                    onChange={handleChange('customerEmail')}
                    className={inputClasses}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2 text-foreground/80">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={handleChange('customerPhone')}
                  className={inputClasses}
                  placeholder="+977 98XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2 text-foreground/80">
                  Delivery Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.shippingAddress}
                  onChange={handleChange('shippingAddress')}
                  className={`${inputClasses} resize-none`}
                  placeholder="Street address, city, ward number, landmarks"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2 text-foreground/80">
                  Special Notes <span className="text-muted-foreground/60 lowercase">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={handleChange('notes')}
                  className={`${inputClasses} resize-none`}
                  placeholder="Drop off instructions or delivery preferences"
                />
              </div>
            </div>

            {/* Step 1b: Shipping zone (estimate only — concierge confirms) */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-foreground tracking-wide uppercase">
                Delivery Zone
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {ATTAR_SHIPPING_ZONES.map((z) => (
                  <label key={z.id} className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${shippingZone === z.id ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-border/70 hover:border-foreground/30'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shippingZone" value={z.id} checked={shippingZone === z.id} onChange={() => setShippingZone(z.id)} className="accent-primary w-4 h-4" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{z.label}</p>
                        <p className="text-xs text-muted-foreground">{z.detail}</p>
                      </div>
                    </div>
                    <Truck className="w-4 h-4 text-muted-foreground" />
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">Estimate only — backend charges cart subtotal; concierge confirms delivery fee.</p>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <span className="w-7 h-7 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                <h2 className="text-base font-semibold text-foreground tracking-wide uppercase">
                  Select Payment Option
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">

                {/* Cash on Delivery Option */}
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'cash_on_delivery'
                      ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
                      : 'border-border/70 hover:border-foreground/30 bg-background/30'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="accent-primary w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay with cash upon package receipt</p>
                    </div>
                  </div>
                  <Truck className="w-5 h-5 text-muted-foreground" />
                </label>

                {/* Fonepay / Bank Mobile App QR Option (Active) */}
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'qr'
                      ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
                      : 'border-border/70 hover:border-foreground/30 bg-background/30'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={() => setPaymentMethod('qr')}
                      className="accent-primary w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Fonepay / Mobile Banking QR</p>
                      <p className="text-xs text-muted-foreground">Scan QR code using any mobile banking app</p>
                    </div>
                  </div>
                  <QrCode className="w-5 h-5 text-primary" />
                </label>

                {/* Integrated QR Payment Interface */}
                {paymentMethod === 'qr' && (
                  <div className="mt-2 p-5 bg-muted/30 border border-border rounded-xl space-y-4 animate-in fade-in duration-200">
                    <div className="text-center space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        Scan & Pay with Mobile Banking / Wallet
                      </p>

                      {/* Dummy Placeholder QR Container */}
                      {/* Dynamic/Static QR Container adjusted for 290 x 531px image */}
                      <div className="bg-white p-3 rounded-xl border border-dashed border-primary/40 shadow-sm inline-flex flex-col items-center justify-center max-w-full">
                        <div className="w-72.5 h-132.75 max-w-full bg-muted/20 border border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                          <img
                            src="/images/qrcode.jpg"
                            alt="Client Payment QR"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback UI showing placeholder guidance if image path isn't set yet
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="flex flex-col items-center gap-2 p-4 text-center text-muted-foreground">
                            <QrCode className="w-12 h-12 text-primary/80" />
                            <span className="font-serif text-sm font-semibold text-foreground">AYESHA FRAGRANCES</span>
                            <span className="font-mono text-[10px] text-muted-foreground/80 tracking-widest uppercase">
                              Official Settlement Portal
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Account Name: <span className="font-semibold text-primary">AYESHA FRAGRANCES</span></p>
                        <p>Total Payable: <span className="font-bold text-primary">NPR {cart?.subtotal.toFixed(2)}</span></p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-foreground/80">
                          Transaction ID / Reference No. <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className={inputClasses}
                          placeholder="e.g. TXN984120391 or Reference No."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-foreground/80">
                          Payment Screenshot <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-background/50 cursor-pointer">
                          <input
                            required
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            {paymentProof ? (
                              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                                <Check className="w-4 h-4" />
                                <span className="truncate max-w-55">{paymentProof.name}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-primary" />
                                <span className="font-medium text-foreground">Upload Payment Screenshot</span>
                                <span className="text-[10px] text-muted-foreground">JPG, PNG format (Max 5MB)</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* eSewa Option (Test mode until keys set) */}
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'esewa' ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-border/70 hover:border-foreground/30 bg-background/30'}`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="esewa"
                      checked={paymentMethod === 'esewa'}
                      onChange={() => setPaymentMethod('esewa')}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        eSewa Wallet
                        <span className="text-[10px] bg-brass/15 text-pine font-medium px-2 py-0.5 rounded border border-brass/40">
                          Test
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">{PAYMENT_GUIDE.esewa}</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </label>

                {/* Khalti Option (Test mode until key set) */}
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'khalti' ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-border/70 hover:border-foreground/30 bg-background/30'}`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="khalti"
                      checked={paymentMethod === 'khalti'}
                      onChange={() => setPaymentMethod('khalti')}
                      className="accent-purple-600 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        Khalti Digital Wallet
                        <span className="text-[10px] bg-brass/15 text-pine font-medium px-2 py-0.5 rounded border border-brass/40">
                          Test
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">{PAYMENT_GUIDE.khalti}</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </label>

              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-background py-4 rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-primary transition-all shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Confirm & Place Order
                </>
              )}
            </button>
          </form>

          {/* Sticky Order Summary Side Panel */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold text-foreground pb-4 border-b border-border/60">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3.5 items-center">
                    <div className="w-14 h-14 bg-muted rounded-lg border border-border shrink-0 overflow-hidden relative">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-0 right-0 bg-foreground/80 text-background text-[10px] font-bold px-1.5 py-0.5 rounded-bl">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Unit: NPR {item.price.toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      NPR {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">NPR {cart?.subtotal.toFixed(2)}</span>
                </div>
                {(() => {
                  const q = quoteShipping(shippingZone, cart?.subtotal ?? 0);
                  return (
                    <div className="flex justify-between text-muted-foreground gap-3">
                      <span>Shipping ({shippingZone})</span>
                      <span className="text-xs text-right font-medium text-foreground">{q.fee === 0 ? "FREE / on request" : `NPR ${q.fee} est.`}<span className="block text-[10px] font-normal text-muted-foreground">{q.note}</span></span>
                    </div>
                  );
                })()}
                <div className="border-t border-border/60 pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-base text-foreground">Total Amount</span>
                  <span className="font-bold text-xl text-primary">
                    NPR {((cart?.subtotal ?? 0) + quoteShipping(shippingZone, cart?.subtotal ?? 0).fee).toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Charged today: NPR {cart?.subtotal.toFixed(2)} (cart only). Shipping confirmed by concierge.</p>
              </div>

              <div className="bg-muted/40 rounded-xl p-3.5 border border-border/40 text-xs text-muted-foreground flex items-start gap-2.5">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>All transactions are guarded by 256-bit encryption. Cash and QR payments can be verified on arrival.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modernized QR Payment Dialog / Modal */}
      {qrModalData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full text-center space-y-5 shadow-2xl relative">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                Scan & Pay
              </span>
              <h3 className="font-serif text-2xl font-bold text-foreground mt-2">Fonepay / Bank QR</h3>
              <p className="text-xs text-muted-foreground">Order Reference #{qrModalData.orderId}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border shadow-inner inline-block relative">
              <img src={qrModalData.qrImageUrl} alt="Payment QR" className="w-48 h-48 mx-auto" />
            </div>

            <div className="space-y-1.5 bg-muted/30 p-3 rounded-xl border border-border/50 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name:</span>
                <span className="font-semibold text-foreground">{qrModalData.accountName}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">Total Payable:</span>
                <span className="font-bold text-base text-primary">NPR {qrModalData.amount.toFixed(2)}</span>
              </div>
              {qrModalData.instructions && (
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 mt-1">
                  {qrModalData.instructions}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setQrModalData(null);
                setOrderPlaced({ id: qrModalData.orderId, method: 'qr' });
              }}
              className="w-full bg-foreground text-background py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-all shadow-md"
            >
              I Have Completed Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}