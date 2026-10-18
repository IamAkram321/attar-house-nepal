import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Search,
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  QrCode,
  Banknote,
  Sparkles,
  ArrowUpRight,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { API_URL } from '@/lib/api-url';

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? 'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border backdrop-blur-sm ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function PaymentBadge({ method }: { method?: string }) {
  const isQr = method?.toLowerCase() === 'qr';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {isQr ? (
        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          <QrCode className="h-3 w-3" /> QR Pay
        </span>
      ) : (
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <Banknote className="h-3 w-3" /> COD
        </span>
      )}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // States for custom delete confirmation modal
  const [orderToDelete, setOrderToDelete] = useState<{ id: number; customer: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch current logged-in user profile to verify superadmin status
  const { data: authData } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Safely extract user object from possible response structures
  const currentUser = authData?.user ?? authData?.data ?? authData;
  
  // Robust check for Super Admin roles/flags
  const userRole = (currentUser?.role || currentUser?.userType || '').toLowerCase();
  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin || 
    currentUser?.is_super_admin || 
    userRole === 'superadmin' || 
    userRole === 'super_admin' ||
    userRole === 'super'
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = new URLSearchParams();
  if (activeTab !== 'all') params.set('status', activeTab);
  if (debouncedSearch) params.set('search', debouncedSearch);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', activeTab, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/orders?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });

  const orders = data?.orders ?? [];

  // Derived stats for metrics cards
  const totalRevenue = orders.reduce((acc: number, curr: any) => acc + Number(curr.totalAmount ?? curr.total ?? 0), 0);
  const pendingCount = orders.filter((o: any) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o: any) => o.status === 'delivered').length;

  const totalColumns = 7;

  // Execute deletion after confirmation
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${API_URL}/api/admin/orders/${orderToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to delete order');
      }

      // Invalidate cache to instantly update table list
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      
      toast.success(`Order #${orderToDelete.id} deleted successfully.`);
      setOrderToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while deleting the order.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 relative">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Order Management</h1>
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Track customer purchases, verify payment proofs, and update shipment status.
            </p>
          </div>
        </div>

        {/* Executive Quick Stats */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${isSuperAdmin ? '4' : '3'} gap-4`}>
          <div className="p-5 rounded-xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">{orders.length}</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Action</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{pendingCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivered Rate</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {orders.length ? Math.round((deliveredCount / orders.length) * 100) : 0}%
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          {isSuperAdmin && (
            <div className="p-5 rounded-xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Volume</p>
                <h3 className="text-2xl font-bold mt-1">NPR {totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ID, customer, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-card border-border/80 focus:border-primary rounded-lg"
            />
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="bg-card border border-border/80 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border/80 text-muted-foreground uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-muted rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-muted rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={totalColumns} className="px-6 py-16 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No orders matching your criteria</p>
                        <p className="text-xs text-muted-foreground">Try clearing your filters or searching with a different term.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => {
                    const customer = order.customerName ?? order.user?.name ?? 'Guest Customer';
                    const initial = customer.charAt(0).toUpperCase();

                    return (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 font-mono font-bold text-foreground">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {initial}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{customer}</p>
                              <p className="text-[11px] text-muted-foreground">{order.customerEmail ?? 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <PaymentBadge method={order.paymentMethod} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          NPR {Number(order.totalAmount ?? order.total ?? 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                              className="h-8 px-3 gap-1.5 text-xs font-medium border-border/80 hover:bg-primary hover:text-primary-foreground transition-all shadow-none"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Details</span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>

                            {/* Show Delete button ONLY for Super Admin */}
                            {isSuperAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrderToDelete({ id: order.id, customer })}
                                className="h-8 px-2.5 text-xs font-medium border-rose-500/30 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-none"
                                title="Delete Order"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Confirmation Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => !isDeleting && setOrderToDelete(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-foreground">Delete Order #{orderToDelete.id}?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This action is permanent and cannot be undone for customer <span className="font-semibold text-foreground">{orderToDelete.customer}</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => setOrderToDelete(null)}
                  className="px-4 text-xs font-medium"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={confirmDeleteOrder}
                  className="px-4 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Order'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}