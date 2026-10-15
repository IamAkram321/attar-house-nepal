import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  CreditCard, 
  User, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Loader2,
  PackageCheck
} from 'lucide-react';
import { API_URL } from '@/lib/api-url';

interface Order {
  id: number;
  totalAmount?: number | string;
  total?: number | string;
  paymentMethod?: string;
  status: string;
  createdAt: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  role?: string;
}

const statusVariants: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  processing: { label: 'Processing', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  shipped: { label: 'Shipped', className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  delivered: { label: 'Delivered', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusVariants[status.toLowerCase()] ?? {
    label: status,
    className: 'bg-muted text-muted-foreground border-border/50',
  };

  return (
    <Badge variant="outline" className={`font-medium capitalize text-xs px-2.5 py-0.5 border ${config.className}`}>
      {config.label}
    </Badge>
  );
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<{ customer: Customer; orders: Order[] }>({
    queryKey: ['admin-customer', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/customers/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch customer details');
      return res.json();
    },
  });

  const customer = data?.customer;
  const orders = data?.orders ?? [];

  const initials = (customer?.name ?? '')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CU';

  const totalSpent = orders.reduce(
    (sum: number, o: Order) => sum + Number(o.totalAmount ?? o.total ?? 0),
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/customers')}
              className="h-9 w-9 border-border/80 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                Customer Overview
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed profile metrics and order history.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card/70 border border-border/80 rounded-xl p-12 text-center shadow-xs">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Retrieving customer account information...</p>
            </div>
          </div>
        ) : !customer ? (
          <div className="bg-card/70 border border-border/80 rounded-xl p-12 text-center shadow-xs">
            <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="font-medium text-foreground text-base">Customer Not Found</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                The customer account you are looking for does not exist or has been removed.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/customers')} className="gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Customers
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Profile & Metrics Card */}
            <div className="bg-card/70 backdrop-blur-md border border-border/80 shadow-sm rounded-xl p-6 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
                <div className="flex items-center gap-4">
                  {customer.avatar ? (
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-border/60 shadow-xs"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold tracking-wider shadow-xs">
                      {initials}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl font-semibold text-foreground">{customer.name}</h2>
                      {customer.role && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold tracking-wider">
                          {customer.role}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>{customer.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/40 self-stretch sm:self-auto justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Verified Customer</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-muted/20 border border-border/40">
                  <div className="p-2.5 rounded-md bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Account Created</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {new Date(customer.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-muted/20 border border-border/40">
                  <div className="p-2.5 rounded-md bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Orders</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-muted/20 border border-border/40">
                  <div className="p-2.5 rounded-md bg-primary/10 text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Lifetime Spent</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      NPR {totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders History Card */}
            <div className="bg-card/70 backdrop-blur-md border border-border/80 shadow-sm rounded-xl overflow-hidden transition-all">
              <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-muted/20">
                <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                  <PackageCheck className="h-5 w-5 text-primary" />
                  Order History
                </h3>
                <span className="text-xs font-medium text-muted-foreground">
                  Showing {orders.length} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-4 font-semibold">Order ID</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Payment Method</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Total (NPR)</th>
                      <th className="px-6 py-4 font-semibold text-right"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground/50 mb-2" />
                            <p className="font-medium text-foreground text-sm">No orders placed yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              This customer has not completed any purchases.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="group hover:bg-muted/30 cursor-pointer transition-colors duration-150"
                        >
                          <td className="px-6 py-4 font-semibold text-foreground">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs capitalize text-foreground">
                            {order.paymentMethod ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted font-medium">
                                {order.paymentMethod}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground text-right">
                            {Number(order.totalAmount ?? order.total ?? 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all inline-block" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}