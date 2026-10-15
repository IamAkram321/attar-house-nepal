import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useGetCart, useUpdateCartItem, useRemoveCartItem } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
      <div className="relative pt-36 pb-24 bg-ivory min-h-screen">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-neutral-200 w-24 rounded-full" />
            <div className="h-10 bg-neutral-200 w-48 rounded-lg mb-8" />
            <div className="h-32 bg-neutral-200 rounded-3xl" />
            <div className="h-32 bg-neutral-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="relative pt-36 pb-28 md:pb-36 bg-ivory text-neutral-900 min-h-screen overflow-hidden flex flex-col items-center justify-center selection:bg-brass/20 selection:text-pine">
        
        {/* Ambient Backdrops */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-brass/10 blur-[140px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 p-10 md:p-16 rounded-3xl border border-neutral-200/90 bg-white/80 backdrop-blur-md shadow-xs text-center max-w-md mx-6"
        >
          <div className="w-16 h-16 rounded-full bg-brass/10 border border-brass/30 flex items-center justify-center mx-auto mb-6 text-brass-deep">
            <ShoppingBag className="w-8 h-8 text-brass" />
          </div>

          <h1 className="font-serif text-3xl text-neutral-950 font-normal mb-3">
            Your Flacon Selection is Empty
          </h1>

          <p className="text-neutral-500 font-light text-sm leading-relaxed mb-8">
            Explore our curated attar oils and discovery sets to find your signature scent.
          </p>

          <Link
            href="/shop"
            className="btn-primary shadow-md group w-full"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative pt-36 pb-28 md:pb-36 bg-ivory text-neutral-900 min-h-screen overflow-hidden selection:bg-brass/20 selection:text-pine">
      
      {/* Light Mesh & Ambient Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-20 top-1/4 w-162.5 h-162.5 rounded-full bg-brass/10 blur-[140px]" />
        <div className="absolute left-10 bottom-20 w-125 h-125 rounded-full bg-sand/60 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] bg-size-[36px_36px] opacity-[0.025]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-6xl">
        
        {/* Header */}
        <div className="mb-12">
          <SectionHeading title="Your Selection" label="01 / Review Order" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="p-5 md:p-6 rounded-3xl border border-neutral-200/90 bg-white/80 backdrop-blur-md shadow-xs flex gap-5 md:gap-6 items-center"
              >
                {/* Product Thumbnail */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-neutral-100 border border-neutral-200/80 overflow-hidden shrink-0 relative">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover filter contrast-[1.02]"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg md:text-xl font-normal text-neutral-900 truncate">
                        {item.productName}
                      </h3>

                      {(item.material || item.color) && (
                        <span className="inline-block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mt-1">
                          {[item.material, item.color].filter(Boolean).join(" · ")}
                        </span>
                      )}

                      {item.personalization && (
                        <p className="text-xs text-pine italic mt-1 font-light">
                          "{item.personalization}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removeItem.isPending}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity & Price Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center rounded-full border border-neutral-200/90 bg-neutral-50 px-2 py-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updateItem.isPending || item.quantity <= 1}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-8 text-center font-mono text-xs font-semibold text-neutral-800">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updateItem.isPending}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-serif text-lg md:text-xl font-normal text-neutral-900">
                      NPR{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="p-8 rounded-3xl border border-neutral-200/90 bg-white/80 backdrop-blur-md shadow-xs sticky top-32 space-y-6">
              
              <h2 className="font-serif text-2xl font-normal text-neutral-900 border-b border-neutral-200/80 pb-4">
                Summary
              </h2>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-neutral-600">
                  <span className="uppercase tracking-wider">Subtotal</span>
                  <span className="font-semibold text-neutral-900 text-sm">
                    NPR{cart?.subtotal?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-neutral-500">
                  <span className="uppercase tracking-wider">Estimated Shipping</span>
                  <span>Calculated at checkout · <Link href="/shipping" className="underline">zones</Link></span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  className="btn-primary shadow-md group w-full"
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
          </motion.div>

        </div>

      </div>
    </div>
  );
}