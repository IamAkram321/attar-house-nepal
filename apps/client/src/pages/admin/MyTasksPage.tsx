import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare,
  ShoppingBag,
  Eye,
  Box,
} from 'lucide-react';
import { API_URL } from '@/lib/api-url';

export default function MyTasksPage() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-my-tasks'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/my-tasks`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch assigned tasks');
      return res.json();
    },
  });

  const orders = data?.orders ?? [];

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">My Assigned Work</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your personal queue of store orders assigned to you.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="h-4 w-4" />
            <span>Standard Orders</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0.2">
              {orders.length}
            </Badge>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 border-b border-border/80 text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-12" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-28" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted rounded-full w-20" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-muted rounded-xl w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground space-y-2">
                      <Box className="h-8 w-8 mx-auto opacity-40" />
                      <p className="text-sm font-medium">No standard orders assigned to you</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-foreground">#{order.id}</td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {order.customerName ?? order.user?.name ?? 'Guest Customer'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold text-[11px]">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        NPR {Number(order.totalAmount ?? order.total ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="h-8 text-xs font-semibold rounded-xl gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" /> Fulfill Order
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
