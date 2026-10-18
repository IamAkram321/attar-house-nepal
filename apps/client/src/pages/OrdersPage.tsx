import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api-url';

interface OrderSummary {
  id: number;
  status: string;
  total: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-pine/10 text-pine border-pine/20',
  processing: 'bg-pine/10 text-pine border-pine/20',
  shipped: 'bg-sky-50 text-sky-800 border-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-pine',
  processing: 'bg-pine',
  shipped: 'bg-sky-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-rose-500',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTotal(total: string): string {
  const n = Number(total);
  if (!Number.isFinite(n)) return `Rs. ${total}`;
  return `Rs. ${n.toLocaleString('en-US')}`;
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_URL}/api/orders/mine`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setIsLoading(false));
  }, [authLoading, user]);

  if (!authLoading && !user) {
    return (
      <div className="pt-12 lg:pt-16 pb-24 bg-background min-h-screen">
        <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
          <p className="eyebrow justify-center">My account</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-coal">
            Sign in to view your orders
          </h1>
          <p className="mt-2 text-sm text-coal/60">
            You'll need an account to see your order history.
          </p>
          <Link href="/login?next=/orders" className="btn-primary mt-6">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 lg:pt-16 pb-24 bg-background text-coal min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Your Orders</h1>
            <p className="mt-2 text-sm sm:text-base text-coal/60">
              {isLoading || authLoading
                ? 'Fetching your order history…'
                : orders.length === 0
                  ? 'Orders you place will appear here.'
                  : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} · tap one to track it.`}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/account"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-coal/60 hover:text-pine transition-colors"
            >
              My Account
            </Link>
            <Link href="/shop" className="btn-outline !px-5 !py-2.5">
              Shop
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {isLoading || authLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-flat p-6">
                  <div className="h-5 w-32 rounded bg-beige animate-pulse" />
                  <div className="mt-3 h-4 w-48 rounded bg-beige animate-pulse" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="card-flat px-6 py-16 text-center">
              <span className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-pine/10 text-pine">
                <Package className="w-7 h-7" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">No orders yet</h2>
              <p className="mt-2 text-sm text-coal/60 max-w-xs mx-auto">
                Once you place an order, it will show up here with live tracking.
              </p>
              <Link href="/shop" className="btn-primary mt-6">
                Start Shopping <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <ol className="space-y-3">
              {orders.map((order) => {
                const key = order.status.toLowerCase();
                return (
                  <li key={order.id}>
                    <Link
                      href={`/orders/${order.id}`}
                      className="card-flat flex items-center gap-4 sm:gap-5 p-5 sm:p-6"
                      aria-label={`Track order ${order.id}, ${STATUS_LABEL[key] ?? order.status}, ${formatTotal(order.total)}`}
                    >
                      <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-pine text-ivory text-sm font-semibold shrink-0">
                        #{order.id}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold truncate">
                          Order #{order.id}
                        </span>
                        <span className="mt-0.5 block text-xs text-coal/55">
                          {formatDate(order.createdAt)}
                        </span>
                        <span
                          className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_STYLES[key] ?? 'bg-beige text-coal/60 border-coal/10'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[key] ?? 'bg-coal/30'}`}
                            aria-hidden
                          />
                          {STATUS_LABEL[key] ?? order.status}
                        </span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className="block font-semibold">{formatTotal(order.total)}</span>
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-pine group-hover:gap-2 transition-all">
                          Track <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
