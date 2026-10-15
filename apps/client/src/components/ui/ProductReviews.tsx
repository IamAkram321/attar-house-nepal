import { useEffect, useState } from 'react';
import { Star, CheckCircle2, MessageSquarePlus, User, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-url';

interface Review {
  id: number;
  customerName: string;
  rating: number;
  title: string | null;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

function StarRow({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hoverValue ?? value);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHoverValue(n)}
            onMouseLeave={() => setHoverValue(null)}
            aria-label={`${n} star rating`}
            className="p-1 rounded-md hover:bg-muted/60 transition-colors focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-transform hover:scale-110 ${
                active ? 'fill-amber-400 text-amber-400' : 'text-border hover:text-muted-foreground'
              }`}
            />
          </button>
        );
      })}
      <span className="text-xs font-semibold text-muted-foreground ml-2">
        {hoverValue ?? value > 0 ? `${hoverValue ?? value} / 5` : 'Select rating'}
      </span>
    </div>
  );
}

interface ProductReviewsProps {
  productId: number;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = () => {
    fetch(`${API_URL}/api/products/${productId}/reviews`)
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => setReviews(data.reviews ?? []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const existingReview = user ? reviews.find((r) => r.customerName === user.name) : undefined;

  // Compute breakdown stats
  const getRatingCount = (star: number) => reviews.filter((r) => Math.round(r.rating) === star).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: 'Please select a star rating', variant: 'destructive' });
      return;
    }
    if (!comment.trim()) {
      toast({ title: 'Please write a comment', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, title: title.trim() || undefined, comment: comment.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.error ?? 'Could not submit review', variant: 'destructive' });
        return;
      }

      toast({ title: 'Review submitted — thank you!' });
      setShowForm(false);
      setRating(0);
      setTitle('');
      setComment('');
      loadReviews();
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-2">
      {/* Header & Overview Section */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Average Rating Banner */}
          <div className="flex items-center gap-5">
            <div className="text-center sm:text-left">
              <span className="font-serif text-4xl font-bold text-foreground">
                {average > 0 ? average.toFixed(1) : '0.0'}
              </span>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                out of 5
              </p>
            </div>

            <div className="space-y-1">
              <StarRow rating={average} size="w-4 h-4" />
              <p className="text-xs text-muted-foreground font-medium">
                Based on <span className="text-foreground font-semibold">{reviews.length}</span>{' '}
                {reviews.length === 1 ? 'customer review' : 'customer reviews'}
              </p>
            </div>
          </div>

          {/* Star Distribution Breakdown */}
          {reviews.length > 0 && (
            <div className="hidden lg:flex flex-col gap-1 w-48 text-xs text-muted-foreground">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = getRatingCount(star);
                const percent = Math.round((count / reviews.length) * 100);
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-right">{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-[10px]">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Button */}
          {user ? (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-all shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </button>
          ) : (
            <p className="text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-xl border border-border/50">
              Sign in to leave a review
            </p>
          )}
        </div>
      </div>

      {/* Review Submission Form Modal / Panel */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-primary/30 p-5 rounded-2xl mb-6 space-y-4 shadow-sm animate-in fade-in duration-200"
        >
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {existingReview ? 'Update Your Review' : 'Share Your Experience'}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-semibold text-foreground/80">
              Your Rating <span className="text-rose-500">*</span>
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider mb-1 font-semibold text-foreground/80">
              Review Title <span className="text-muted-foreground/60 lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-border/80 bg-background/50 focus:bg-background rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Long-lasting oud, beautiful dry-down"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider mb-1 font-semibold text-foreground/80">
              Comments <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-border/80 bg-background/50 focus:bg-background rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Longevity on skin? Sillage? Occasion (daily / prayer / evening)? Layering pair?"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-foreground text-background px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </form>
      )}

      {/* Review List Section */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-card border border-border/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 bg-card border border-border/50 rounded-2xl p-6">
          <p className="text-xs text-muted-foreground">No reviews yet for this item.</p>
          <p className="text-[11px] text-muted-foreground/80 mt-1">Be the first to share your feedback!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Header: User & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-bold border border-border">
                      {review.customerName ? review.customerName[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{review.customerName}</p>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <StarRow rating={review.rating} size="w-3.5 h-3.5" />
                </div>

                {/* Content */}
                <div>
                  {review.title && (
                    <h4 className="text-xs font-bold text-foreground mb-0.5">{review.title}</h4>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              </div>

              {/* Date Footer */}
              <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] text-muted-foreground/70">
                <span>
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}