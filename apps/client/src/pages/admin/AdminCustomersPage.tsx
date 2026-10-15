import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Search, Users, ChevronRight, Mail, Calendar, ShoppingBag, CreditCard, UserX } from 'lucide-react';
import { API_URL } from '@/lib/api-url';

interface Customer {
  id: number;
  name?: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  orderCount?: number;
  _count?: {
    orders?: number;
  };
  totalSpent?: number | string;
}

export default function AdminCustomersPage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams();
  if (debouncedSearch) params.set('search', debouncedSearch);

  const { data, isLoading } = useQuery<{ customers: Customer[] }>({
    queryKey: ['admin-customers', debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/customers?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
  });

  const customers = data?.customers ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
              <Users className="h-7 w-7 text-primary" />
              Customers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View customer profiles, purchase records, and engagement history.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-card/80 border-border/80 shadow-xs focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Content Table Card */}
        <div className="bg-card/70 backdrop-blur-md border border-border/80 shadow-sm rounded-xl overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Orders</th>
                  <th className="px-6 py-4 font-semibold">Total Spent</th>
                  <th className="px-6 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 font-semibold text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-muted rounded-full shrink-0" />
                          <div className="h-4 bg-muted rounded w-28" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-36" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-12" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-muted rounded w-4 ml-auto" /></td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                          <UserX className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <p className="font-medium text-foreground text-base">No customers found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {debouncedSearch ? 'Try adjusting your search criteria.' : 'There are no registered customer profiles yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const initials = (customer.name ?? '')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'CU';

                    const orderCount = customer.orderCount ?? customer._count?.orders ?? 0;
                    const spent = Number(customer.totalSpent ?? 0);

                    return (
                      <tr
                        key={customer.id}
                        onClick={() => navigate(`/admin/customers/${customer.id}`)}
                        className="group hover:bg-muted/30 cursor-pointer transition-colors duration-150"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.name ?? 'Customer'}
                                className="h-9 w-9 rounded-full object-cover border border-border/60 shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                {initials}
                              </div>
                            )}
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {customer.name ?? '—'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-3.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                            <span className="truncate max-w-[180px] sm:max-w-xs">{customer.email ?? '—'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-3.5 text-xs">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-foreground font-medium">
                            <ShoppingBag className="h-3 w-3 text-muted-foreground shrink-0" />
                            {orderCount}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-xs font-semibold text-foreground">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                            <span>NPR {spent.toLocaleString()}</span>
                          </div>
                        </td>

                        <td className="px-6 py-3.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                            {new Date(customer.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </td>

                        <td className="px-6 py-3.5 text-right">
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all inline-block" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}