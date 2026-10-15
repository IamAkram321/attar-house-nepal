import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ExternalLink,
  ImageIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  QrCode,
  ShieldCheck,
  Package,
  Clock,
  CheckCircle2,
  Copy,
  Sparkles,
} from 'lucide-react';
import { API_URL } from '@/lib/api-url';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

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

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/orders/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    },
  });

  useEffect(() => {
    if ((data as any)?.order?.status) {
      setSelectedStatus((data as any).order.status);
    }
  }, [data]);

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Status updated', description: 'Order status has been updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
    },
  });

  const order = (data as any)?.order;
  const items = (data as any)?.items ?? [];

  const getProofUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Transaction ID copied to clipboard' });
  };

  // Determine order status step index for progress tracker
  const currentStatusIdx = ORDER_STATUSES.indexOf(order?.status ?? 'pending');

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Navigation & Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/orders')}
              className="h-9 w-9 rounded-xl border-border/80 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Order #{id}</h1>
                {order && <StatusBadge status={order.status} />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Placed on {order ? new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-96 bg-card border border-border/80 rounded-2xl animate-pulse" />
        ) : !order ? (
          <div className="bg-card border border-border/80 rounded-2xl p-12 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium">Order details not found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Main Order Content) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Order Fulfillment Progress Tracker */}
              {order.status !== 'cancelled' && (
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Fulfillment Pipeline</h3>
                  <div className="grid grid-cols-5 gap-2 relative">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                      const isCompleted = idx <= currentStatusIdx;
                      return (
                        <div key={step} className="flex flex-col items-center text-center space-y-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                          </div>
                          <span className={`text-[11px] font-medium capitalize ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customer & Shipping Information Card */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <User className="h-4 w-4 text-primary" />
                  <h2 className="font-serif font-bold text-base text-foreground">Customer Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground font-medium">Full Name</p>
                      <p className="font-semibold text-foreground text-sm mt-0.5">{order.customerName ?? order.user?.name ?? '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground font-medium">Email Address</p>
                      <p className="font-semibold text-foreground text-sm mt-0.5">{order.customerEmail ?? order.user?.email ?? '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground font-medium">Phone Number</p>
                      <p className="font-semibold text-foreground text-sm mt-0.5">{order.customerPhone?.trim() || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground font-medium">Payment Method</p>
                      <p className="font-semibold text-foreground text-sm mt-0.5 capitalize">
                        {order.paymentMethod ? order.paymentMethod.replace('_', ' ') : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-3 border-t border-border/40 pt-4">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground font-medium">Delivery Address</p>
                      <p className="font-medium text-foreground text-sm mt-0.5 leading-relaxed">
                        {order.shippingAddress
                          ? typeof order.shippingAddress === 'string'
                            ? order.shippingAddress
                            : [
                              order.shippingAddress.street,
                              order.shippingAddress.city,
                              order.shippingAddress.state,
                              order.shippingAddress.country,
                            ]
                              .filter(Boolean)
                              .join(', ')
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="sm:col-span-2 bg-muted/30 p-3.5 rounded-xl border border-border/60">
                      <p className="text-muted-foreground font-medium mb-1">Customer Instructions / Notes</p>
                      <p className="text-foreground italic">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Payment Verification Card */}
              {(order.transactionId || order.paymentProof || order.paymentMethod === 'qr') && (
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <h2 className="font-serif font-bold text-base text-foreground">Payment Verification</h2>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      QR Gateway
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <p className="text-muted-foreground font-medium mb-1.5">Submitted Transaction ID</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-sm bg-muted/60 text-foreground px-3 py-1.5 rounded-lg border border-border/60">
                          {order.transactionId || 'Not provided'}
                        </code>
                        {order.transactionId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(order.transactionId)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground font-medium mb-2">Uploaded Proof Screenshot</p>
                      {order.paymentProof ? (
                        <div className="relative group max-w-md rounded-xl border border-border/80 overflow-hidden bg-black/5 dark:bg-white/5">
                          <img
                            src={getProofUrl(order.paymentProof)}
                            alt="Payment Proof"
                            className="w-full max-h-72 object-contain py-2 transition-transform duration-300 group-hover:scale-105"
                          />
                          <a
                            href={getProofUrl(order.paymentProof)}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-xs gap-2 backdrop-blur-xs"
                          >
                            <ExternalLink className="h-4 w-4" /> Open Original Image
                          </a>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground space-y-1">
                          <ImageIcon className="h-5 w-5 mx-auto opacity-40" />
                          <p className="italic">No payment proof screenshot attached</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Purchased Items Table */}
              <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border/80 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h2 className="font-serif font-bold text-base text-foreground">Purchased Items</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/30 border-b border-border/80 text-muted-foreground uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-3.5">Product</th>
                        <th className="px-6 py-3.5">Price</th>
                        <th className="px-6 py-3.5 text-center">Qty</th>
                        <th className="px-6 py-3.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                            No items found for this order.
                          </td>
                        </tr>
                      ) : (
                        items.map((item: any, idx: number) => {
                          const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
                          const subtotal = unitPrice * item.quantity;
                          return (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {item.productImage && (
                                    <img
                                      src={item.productImage}
                                      alt=""
                                      className="h-10 w-10 rounded-lg object-cover border border-border/60 shrink-0"
                                    />
                                  )}
                                  <div>
                                    <p className="font-semibold text-foreground text-sm">
                                      {item.productName ?? item.product?.name ?? '—'}
                                    </p>
                                    {(item.color || item.material) && (
                                      <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {[item.color, item.material].filter(Boolean).join(' • ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-medium text-foreground">
                                NPR {unitPrice.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-foreground">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 text-right font-semibold text-foreground">
                                NPR {subtotal.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot className="border-t border-border/80 bg-muted/20 font-bold text-foreground">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right uppercase tracking-wider text-[11px] text-muted-foreground">
                          Grand Total
                        </td>
                        <td className="px-6 py-4 text-right text-base text-primary">
                          NPR {Number(order.totalAmount ?? order.total ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column (Actions & Controls Sidebar) */}
            <div className="space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6 sticky top-6">
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground mb-1">Update Status</h3>
                  <p className="text-xs text-muted-foreground">Change the current state of this order.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Select New Status</label>
                    <Select
                      value={selectedStatus || order.status}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="h-10 text-xs font-medium rounded-xl border-border/80">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full h-10 text-xs font-semibold rounded-xl shadow-sm transition-all"
                    onClick={() => updateStatus.mutate(selectedStatus || order.status)}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? 'Updating...' : 'Save Order Status'}
                  </Button>
                </div>

                <div className="border-t border-border/60 pt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Payment Status</span>
                    <span className="font-semibold text-foreground capitalize">
                      {order.paymentStatus ? order.paymentStatus.replace('_', ' ') : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Order ID</span>
                    <span className="font-mono text-foreground font-medium">#{order.id}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}