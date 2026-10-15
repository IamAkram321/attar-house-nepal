import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Layers, 
  ChevronRight,
  Receipt
} from 'lucide-react';
import { Link } from 'wouter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '@/lib/api-url';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
  processing: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
  under_review: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50',
  quotation_sent: 'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50',
  approved: 'bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/50',
  in_production: 'bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/50',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide capitalize border shadow-2xs ${statusStyles[status] ?? 'bg-muted text-muted-foreground border-border'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  primary = false,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: any;
  primary?: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
        primary
          ? 'bg-foreground text-background border-foreground/90 shadow-sm'
          : 'bg-card/70 backdrop-blur-sm border-border/80 text-card-foreground shadow-xs hover:border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold tracking-wider uppercase ${primary ? 'text-background/70' : 'text-muted-foreground'}`}>
          {title}
        </span>
        <div className={`p-2 rounded-lg ${primary ? 'bg-background/10 text-background' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-2xl font-serif font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${primary ? 'text-background/60' : 'text-muted-foreground'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

interface TrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-foreground text-background px-3.5 py-2.5 rounded-lg text-xs shadow-xl border border-border/20 backdrop-blur-md">
      <p className="text-background/60 text-[10px] uppercase font-semibold tracking-wider mb-1">
        {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <div className="space-y-0.5">
        <p className="font-serif text-sm font-semibold text-primary">
          NPR {Number(payload[0]?.value ?? 0).toLocaleString()}
        </p>
        <p className="text-background/80">
          {payload[1]?.value ?? 0} {payload[1]?.value === 1 ? 'order' : 'orders'}
        </p>
      </div>
    </div>
  );
}

function RevenueTrendChart({ trend }: { trend: TrendPoint[] }) {
  if (trend.length === 0) {
    return (
      <div className="h-60 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
        <TrendingUp className="h-8 w-8 stroke-[1.5] text-muted-foreground/40" />
        <p>Not enough sales record to display revenue trends.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={trend} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary, #B8956A)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-primary, #B8956A)" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-border/40" />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-muted-foreground/80"
          axisLine={false}
          tickLine={false}
          minTickGap={20}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-muted-foreground/80"
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="var(--color-primary, #B8956A)" 
          strokeWidth={2.5} 
          fill="url(#revenueGradient)" 
          activeDot={{ r: 5, strokeWidth: 0, className: 'fill-primary' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/dashboard`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
      return res.json();
    },
  });

  const trend: TrendPoint[] = data?.trend ?? [];
  const trendRevenue = trend.reduce((sum, d) => sum + d.revenue, 0);
  const trendOrders = trend.reduce((sum, d) => sum + d.orders, 0);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Store performance overview, live trends, and customer orders.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card/70 border border-border/80 rounded-xl p-5 h-28" />
              ))}
            </div>
            <div className="bg-card/70 border border-border/80 rounded-xl h-80" />
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card/70 border border-border/80 rounded-xl h-64" />
              <div className="bg-card/70 border border-border/80 rounded-xl h-64" />
            </div>
          </div>
        ) : (
          <>
            {/* Stat Cards Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Revenue"
                value={`NPR ${Number(data?.revenue?.total ?? 0).toLocaleString()}`}
                icon={TrendingUp}
                primary
              />
              <MetricCard
                title="Total Orders"
                value={data?.orders?.total ?? 0}
                icon={ShoppingBag}
              />
              <MetricCard
                title="Pending"
                value={data?.orders?.pending ?? 0}
                icon={Clock}
              />
              <MetricCard
                title="Processing"
                value={data?.orders?.processing ?? 0}
                icon={Layers}
              />
              <MetricCard
                title="Delivered"
                value={data?.orders?.delivered ?? 0}
                icon={CheckCircle2}
              />
              <MetricCard
                title="Customers"
                value={data?.customers?.total ?? 0}
                icon={Users}
              />
            </div>

            {/* Low Stock Warning */}
            {(data?.products?.lowStock ?? 0) > 0 && (
              <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 px-4 py-3 rounded-xl shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium">
                    {data.products.lowStock} {data.products.lowStock === 1 ? 'product is' : 'products are'} running low on inventory stock.
                  </span>
                </div>
                <Link 
                  href="/admin/products" 
                  className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0"
                >
                  Manage Stock <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Revenue Analytics Section */}
            <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-xl p-6 shadow-xs">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-foreground">Revenue Trend</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Performance over the last 30 days</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-serif font-bold text-foreground block">
                    NPR {trendRevenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">{trendOrders} orders fulfilled</span>
                </div>
              </div>
              <RevenueTrendChart trend={trend} />
            </div>

            {/* Tables Grid Section */}
            <div className="grid gap-6">
              {/* Recent Orders */}
              <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-xl overflow-hidden shadow-xs flex flex-col">
                <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    <h2 className="font-serif text-base font-semibold text-foreground">Recent Orders</h2>
                  </div>
                  <Link href="/admin/orders" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/10 text-muted-foreground uppercase font-semibold tracking-wider">
                        <th className="px-5 py-3">Order</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {(data?.recentOrders ?? []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                            No orders placed recently.
                          </td>
                        </tr>
                      ) : (
                        (data?.recentOrders ?? []).map((order: any) => (
                          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3 font-semibold text-foreground">#{order.id}</td>
                            <td className="px-5 py-3 text-muted-foreground truncate max-w-[120px]">
                              {order.customerName ?? order.user?.name ?? '—'}
                            </td>
                            <td className="px-5 py-3 font-medium text-foreground">
                              NPR {Number(order.totalAmount ?? order.total ?? 0).toLocaleString()}
                            </td>
                            <td className="px-5 py-3">
                              <StatusBadge status={order.status} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}