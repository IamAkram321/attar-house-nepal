import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Star, MessageSquare, Search, CheckCircle2, Loader2, Filter } from 'lucide-react';
import { API_URL } from '@/lib/api-url';

interface Review {
  id: number;
  productName?: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');

  const { data, isLoading } = useQuery<{ reviews: Review[] }>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/reviews`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete review');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Review deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setDeleteId(null);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete review', variant: 'destructive' }),
  });

  const reviews = data?.reviews ?? [];

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'ALL' || r.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
              <MessageSquare className="h-7 w-7 text-primary" />
              Customer Reviews
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor, moderate, and manage customer product feedback and ratings.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3.5 py-2 rounded-lg border border-border/50">
            <span className="font-medium text-foreground">{reviews.length}</span> Total Reviews
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/50 backdrop-blur-md p-3 rounded-xl border border-border/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product, customer, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1 shrink-0" />
            {(['ALL', 5, 4, 3, 2, 1] as const).map((star) => (
              <Button
                key={star}
                variant={ratingFilter === star ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRatingFilter(star)}
                className="h-8 text-xs font-medium gap-1 px-2.5 rounded-lg shrink-0"
              >
                {star === 'ALL' ? (
                  'All Stars'
                ) : (
                  <>
                    <span>{star}</span>
                    <Star className="h-3 w-3 fill-current" />
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Reviews Table Card */}
        <div className="bg-card/70 backdrop-blur-md border border-border/80 shadow-sm rounded-xl overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Rating</th>
                  <th className="px-6 py-4 font-semibold">Review</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Loading customer reviews...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                          <MessageSquare className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <p className="font-medium text-foreground text-base">No reviews found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {searchQuery || ratingFilter !== 'ALL'
                            ? 'Try resetting your search filters.'
                            : 'Customer reviews will appear here once submitted.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((r) => (
                    <tr
                      key={r.id}
                      className="group hover:bg-muted/30 transition-colors duration-150 align-top"
                    >
                      <td className="px-6 py-4 font-medium text-foreground text-sm max-w-[200px]">
                        <span className="line-clamp-2">{r.productName ?? '—'}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground text-sm">{r.customerName}</div>
                        {r.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified Purchase
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md w-fit">
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{r.rating}.0</span>
                          <div className="flex items-center gap-0.5 ml-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`w-3 h-3 ${
                                  n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-sm">
                        {r.title && (
                          <p className="font-medium text-foreground text-sm mb-1 line-clamp-1">{r.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{r.comment}</p>
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent className="rounded-xl border border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif">Delete Review?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                This action cannot be undone. This review will be permanently deleted and the target product's overall rating will automatically update.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-9 px-3 text-xs">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId !== null && deleteReview.mutate(deleteId)}
                className="h-9 px-3 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteReview.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Delete Review'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}