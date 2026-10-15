import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Check, X, ArrowLeft, Package, Truck, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api-url';

interface OrderItem {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: string;
  material: string | null;
  color: string | null;
}

interface OrderDetail {
  id: number;
  status: string;
  total: string;
  customerName: string;
  shippingAddress: string;
  createdAt: string;
}

const STEPS = [
  { key: 'pending', label: 'Order Placed', description: 'We have received your order' },
  { key: 'confirmed', label: 'Confirmed', description: 'Payment & specs verified' },
  { key: 'processing', label: 'In Atelier', description: 'Attar filling & sealing' },
  { key: 'shipped', label: 'Shipped', description: 'On the way to your address' },
  { key: 'delivered', label: 'Delivered', description: 'Order completed' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading || !user || !id) return;

    fetch(`${API_URL}/api/orders/mine/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setOrder(data.order);
          setItems(data.items ?? []);
        }
      })
      .finally(() => setIsLoading(false));
  }, [authLoading, user, id]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen pt-36 pb-24 flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center bg-card border border-border p-8 rounded-2xl shadow-xl space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to track order</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Please log in with your account to view live tracking updates for Order #{id}.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-md"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen pt-36 pb-24 bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Fetching order details...</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen pt-36 pb-24 flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center bg-card border border-border p-8 rounded-2xl shadow-xl space-y-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Not Found</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              This order doesn't exist or is not associated with your account.
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all border border-border"
          >
            Back to All Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="pt-36 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <Link 
            href="/orders" 
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Order #{order.id}
                </h1>
                {isCancelled ? (
                  <span className="bg-destructive/10 text-destructive text-xs font-semibold px-3 py-1 rounded-full border border-destructive/20">
                    Cancelled
                  </span>
                ) : (
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20 capitalize">
                    {order.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 border-border pt-3 sm:pt-0">
              <span className="text-xs uppercase tracking-wider text-muted-foreground block font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-foreground">
                Rs. {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Live Status Tracker
          </h2>

          {isCancelled ? (
            <div className="flex items-center gap-3 border border-destructive/30 bg-destructive/5 text-destructive px-6 py-4 rounded-xl">
              <X className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">This order has been cancelled.</span>
            </div>
          ) : (
            <div className="relative">
              {/* Desktop Progress Bar */}
              <div className="hidden md:block">
                <div className="flex items-center justify-between relative z-10">
                  {STEPS.map((step, i) => {
                    const isDone = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center max-w-30">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                            isDone
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                              : 'bg-muted border border-border text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                        >
                          {isDone ? <Check className="w-5 h-5" /> : i + 1}
                        </div>
                        <span className={`text-xs font-semibold mt-3 ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight hidden lg:block">
                          {step.description}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Connecting Line */}
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-border z-0">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-6 relative pl-6 border-l-2 border-border ml-3">
                {STEPS.map((step, i) => {
                  const isDone = i <= currentStepIndex;
                  return (
                    <div key={step.key} className="relative">
                      <div
                        className={`absolute -left-7.75 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDone
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted border border-border text-muted-foreground'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Items & Shipping Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Items List */}
          <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Ordered Items ({items.reduce((acc, item) => acc + item.quantity, 0)})
            </h2>

            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-muted rounded-xl border border-border shrink-0 overflow-hidden">
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{item.productName}</p>
                    {item.material && <p className="text-xs text-muted-foreground mt-0.5">Material: {item.material}</p>}
                    {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-sm text-foreground">
                      Rs. {(Number(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mt-4 flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-semibold">Rs. {Number(order.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping & Delivery Address */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 h-fit">
            <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Delivery Details
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground block font-semibold">Customer Name</span>
                <p className="font-semibold text-foreground mt-0.5">{order.customerName}</p>
              </div>

              <div className="border-t border-border pt-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block font-semibold">Shipping Address</span>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">{order.shippingAddress}</p>
              </div>

              <div className="border-t border-border pt-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block font-semibold">Payment Method</span>
                <p className="font-medium text-foreground mt-0.5">Cash on Delivery (COD)</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}