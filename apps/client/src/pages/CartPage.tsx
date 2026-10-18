import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useGetCart, useUpdateCartItem, useRemoveCartItem } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function CartPage() {
  const { refreshCart } = useCart();
  const { toast } = useToast();

  const { data: cart, isLoading } = useGetCart({
    query: { queryKey: ["cart"] },
  });

  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    updateItem.mutate(
      { itemId, data: { quantity } },
      {
        onSuccess: () => refreshCart(),
        onError: () => toast({ title: "Could not update quantity", variant: "destructive" }),
      }
    );
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate(
      { itemId },
      {
        onSuccess: () => {
          toast({ title: "Item removed from cart" });
          refreshCart();
        },
        onError: () => toast({ title: "Could not remove item", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="pt-12 pb-20 bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="h-4 bg-border w-24 rounded" />
            <div className="h-10 bg-border w-48 rounded-lg mb-8" />
            <div className="h-32 bg-border rounded-xl" />
            <div className="h-32 bg-border rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="pt-12 pb-24 bg-background text-foreground min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6 text-secondary">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Your bag is empty
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md text-center">
          Explore our curated attar oils and discovery sets to find your signature scent.
        </p>

        <Link
          href="/shop"
          className="btn-primary shadow-md group w-full max-w-xs"
        >
          <span>Explore Collection</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="mb-8">
          <SectionHeading title="Your Selection" label="Review Order" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-5 md:p-6 rounded-lg border border-border bg-card flex gap-5 md:gap-6 items-center">
                {/* Product Thumbnail */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg md:text-xl text-foreground truncate">
                        {item.productName}
                      </h3>

                      {(item.material || item.color) && (
                        <span className="inline-block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60 mt-1">
                          {[item.material, item.color].filter(Boolean).join(" · ")}
                        </span>
                      )}

                      {item.personalization && (
                        <p className="text-xs text-accent-foreground italic mt-1 font-light">
                          "{item.personalization}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removeItem.isPending}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity & Price Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center rounded-full border border-border bg-muted px-2 py-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updateItem.isPending || item.quantity <= 1}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-8 text-center font-mono text-xs font-semibold text-foreground">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updateItem.isPending}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-semibold text-lg md:text-xl text-foreground">
                      NPR{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-lg border border-border bg-card sticky top-4 space-y-6">

              <h2 className="font-semibold text-xl text-foreground border-b border-border pb-4">
                Summary
              </h2>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="uppercase tracking-wider">Subtotal</span>
                  <span className="font-semibold text-foreground text-sm">
                    NPR{cart?.subtotal?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-muted-foreground/60">
                  <span className="uppercase tracking-wider">Estimated Shipping</span>
                  <span>Calculated at checkout · <Link href="/shipping" className="underline">zones</Link></span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  className="btn-primary w-full"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/shop"
                  className="btn-outline w-full"
                >
                  Continue Browsing
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
