import { Link } from "wouter";
import { LogOut, Package, ShieldCheck, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { user, isLoading, isAdmin, logout } = useAuth();
  const { cartItemCount } = useCart();

  if (isLoading) {
    return (
      <div className="pt-36 pb-24 min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading your account…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-36 pb-24 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Sign in to view your account</h1>
        <p className="text-coal/60 mb-8 max-w-sm">
          Your profile details, orders and shopping bag live here once you're signed in.
        </p>
        <Link href="/login?next=/account" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="pt-36 lg:pt-40 pb-24 bg-ivory text-coal min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="eyebrow">My account</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">Profile</h1>

        {/* User details */}
        <div className="card-flat mt-8 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-brass/50 shrink-0"
            />
          ) : (
            <span className="flex items-center justify-center h-20 w-20 rounded-full bg-pine text-ivory shrink-0">
              {initials ? (
                <span className="text-2xl font-semibold">{initials}</span>
              ) : (
                <User className="w-8 h-8" />
              )}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xl font-semibold truncate">{user.name}</p>
            <p className="mt-0.5 text-sm text-coal/60 truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <span className="rounded-full bg-pine/10 text-pine px-3 py-1">
                {user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ADMIN" ? "Admin" : "Customer"}
              </span>
              {memberSince && (
                <span className="text-coal/50 normal-case tracking-normal font-medium">
                  Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Link
            href="/orders"
            className="card-flat card-hover p-5 flex items-center gap-4"
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-pine/10 text-pine shrink-0">
              <Package className="w-5 h-5" />
            </span>
            <span>
              <span className="block font-semibold">My Orders</span>
              <span className="block text-xs text-coal/55 mt-0.5">Track and review past orders</span>
            </span>
          </Link>
          <Link href="/cart" className="card-flat card-hover p-5 flex items-center gap-4">
            <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-pine/10 text-pine shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span>
              <span className="block font-semibold">
                Shopping Bag{cartItemCount > 0 ? ` (${cartItemCount})` : ""}
              </span>
              <span className="block text-xs text-coal/55 mt-0.5">Items reserved for checkout</span>
            </span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/orders"
              className="card-flat card-hover p-5 flex items-center gap-4 sm:col-span-2"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-brass/15 text-brass-deep shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span>
                <span className="block font-semibold">Admin Console</span>
                <span className="block text-xs text-coal/55 mt-0.5">Manage orders, catalog and carousel</span>
              </span>
            </Link>
          )}
        </div>

        <Button
          variant="outline"
          onClick={logout}
          className="mt-6 gap-2 rounded-lg text-rose-700 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
