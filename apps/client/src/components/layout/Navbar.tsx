import { Link, useLocation, useSearch } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { BrandLogo } from "../common/BrandLogo";
import {
  buildShopHref,
  searchCatalog,
  useCatalogProducts,
  type CatalogSearchHit,
} from "../../lib/catalog";
import { useListCollections } from "@workspace/api-client-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "For Him", href: buildShopHref({ audience: "him" }) },
  { label: "For Her", href: buildShopHref({ audience: "her" }) },
  { label: "Unisex", href: buildShopHref({ audience: "unisex" }) },
  { label: "Attars", href: buildShopHref({ kind: "attar" }) },
  { label: "Perfumes", href: buildShopHref({ kind: "perfume" }) },
  { label: "Bestsellers", href: buildShopHref({ preset: "bestsellers" }) },
  { label: "Brands", href: "/brands" },
  { label: "Offers", href: "/offers" },
] as const;

function useSearchHits(query: string): CatalogSearchHit[] {
  const { products } = useCatalogProducts(80);
  const { data: collectionsData } = useListCollections({ query: { queryKey: ["collections"] } });
  const collections = useMemo(
    () => (Array.isArray(collectionsData) ? collectionsData : []).map((c: any) => ({ name: c.name, slug: c.slug })),
    [collectionsData]
  );
  return useMemo(() => searchCatalog(products, collections, query, 6), [products, collections, query]);
}

function AccountAvatar({ user }: { user: { avatar?: string | null; name: string } | null }) {
  const [broken, setBroken] = useState(false);
  if (!user || !user.avatar || broken) {
    return <User className="w-4 h-4" />;
  }
  return (
    <img
      src={user.avatar}
      alt={user.name}
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="h-6 w-6 rounded-full object-cover"
    />
  );
}

function useIsScrolled() {  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

export function Navbar() {
  const [location] = useLocation();
  const searchString = useSearch();
  const { cartItemCount } = useCart();
  const { user } = useAuth();
  const isScrolled = useIsScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const hits = useSearchHits(debounced);

  useEffect(() => {
    setMobileOpen(false);
    setSearchFocused(false);
  }, [location, searchString]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(searchValue.trim()), 180);
    return () => window.clearTimeout(t);
  }, [searchValue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchFocused(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    if (href.startsWith("/shop")) {
      const current = new URLSearchParams(searchString.startsWith("?") ? searchString : `?${searchString}`);
      const target = new URLSearchParams(href.split("?")[1] ?? "");
      for (const [k, v] of target.entries()) {
        if ((current.get(k) ?? "") !== v) return false;
      }
      return location.startsWith("/shop");
    }
    return location.startsWith(href);
  };

  const submitSearch = (value: string) => {
    const q = value.trim();
    setSearchFocused(false);
    window.location.href = q ? buildShopHref({ search: q }) : "/shop";
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        {/* Main bar — solid so content never shows through while scrolling */}
        <div className="w-full border-b border-line bg-ivory">
          <div
            className={`mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-3 transition-all duration-300 ${
              isScrolled ? "h-12" : "h-14 sm:h-16"
            }`}
          >
            <button
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg border border-coal/15 bg-white text-coal shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center shrink-0" aria-label="Attar House Nepal home">
              <BrandLogo size="md" />
            </Link>

            {/* Desktop search */}
            <div className="relative hidden md:block flex-1 max-w-xl mx-auto">
              <div className="flex items-center gap-2 rounded-lg border border-coal/15 bg-white pl-4 pr-1.5 py-1.5 focus-within:border-pine transition-colors">
                <Search className="w-4 h-4 text-coal/40 shrink-0" />
                <input
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch(searchValue);
                  }}
                  placeholder="Search Blueberry Musk, Hawas, Khamrah…"
                  aria-label="Search products"
                  className="w-full bg-transparent text-sm text-coal placeholder:text-coal/40 focus:outline-none"
                />
                {searchValue && (
                  <button
                    onClick={() => {
                      setSearchValue("");
                      setDebounced("");
                    }}
                    className="p-1.5 text-coal/40 hover:text-coal"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => submitSearch(searchValue)}
                  className="shrink-0 rounded-md bg-pine text-ivory px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-pine-deep transition-colors"
                >
                  Search
                </button>
              </div>

              <AnimatePresence>
                {searchFocused && debounced && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-coal/10 bg-white shadow-xl z-50"
                  >
                    {hits.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-coal/60">
                        No matches for “{debounced}”. Try “musk”, “oud”, “Al-Nuaim” or “khamrah”.
                      </p>
                    ) : (
                      <ul className="max-h-80 overflow-y-auto py-2">
                        {hits.map((hit) => (
                          <li key={`${hit.type}-${hit.label}`}>
                            <Link
                              href={hit.href}
                              className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-beige/60 transition-colors"
                            >
                              <span>
                                <span className="block text-sm font-medium text-coal">{hit.label}</span>
                                <span className="block text-[10px] uppercase tracking-[0.14em] text-coal/50">
                                  {hit.detail}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      onClick={() => submitSearch(searchValue)}
                      className="w-full border-t border-coal/10 px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-pine hover:bg-beige/60"
                    >
                      See all results for “{debounced}”
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Link
                href={buildShopHref({ preset: "favourites" })}
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg border border-coal/15 bg-white text-coal hover:border-pine transition-colors"
                aria-label="Customer favourites"
                title="Customer favourites"
              >
                <Heart className="w-4 h-4" />
              </Link>

              <Link
                href={user ? "/account" : "/login"}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-coal/15 bg-white text-coal hover:border-pine transition-colors"
                aria-label="Account"
                title={user ? `Signed in as ${user.name}` : "Sign in"}
              >
                <AccountAvatar user={user} />
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center gap-2 rounded-lg bg-pine px-4 h-10 text-ivory hover:bg-pine-deep transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.14em]">Bag</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brass-deep text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden px-4 pb-3">
            <div className="flex items-center gap-2 rounded-lg border border-coal/15 bg-white pl-4 pr-1.5 py-1.5">
              <Search className="w-4 h-4 text-coal/40 shrink-0" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch(searchValue);
                }}
                placeholder="Search attars, brands…"
                aria-label="Search products"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
              <button
                onClick={() => submitSearch(searchValue)}
                className="shrink-0 rounded-md bg-pine text-ivory px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
              >
                Go
              </button>
            </div>
          </div>

          {/* Desktop primary nav — direct links, no dropdowns */}
          <nav className="hidden lg:block border-t border-coal/10" aria-label="Primary">
            <ul className="mx-auto max-w-7xl px-6 flex items-center gap-1">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`relative flex items-center px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors min-h-[46px] ${
                        active ? "text-pine" : "text-coal/70 hover:text-pine"
                      }`}
                    >
                      {item.label}
                      {active && <span className="absolute left-4 right-4 bottom-1 h-0.5 bg-brass rounded-full" aria-hidden />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile drawer — flat list, no nested menus */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-charcoal/50 z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.26 }}
              className="fixed top-0 left-0 bottom-0 w-[min(340px,90vw)] bg-ivory z-[70] flex flex-col lg:hidden shadow-2xl"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
                <BrandLogo size="sm" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-11 h-11 rounded-lg border border-coal/15 bg-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-2" aria-label="Mobile">
                {NAV_LINKS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between px-6 py-4 text-[15px] border-b border-coal/5 min-h-[52px] ${
                        active ? "font-semibold text-pine bg-pine/5" : "font-medium text-coal"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-line px-5 py-4 flex gap-3 shrink-0">
                <Link
                  href={user ? "/account" : "/login"}
                  className="flex-1 text-center rounded-lg bg-pine text-ivory px-3 py-3 text-sm font-semibold min-h-[48px]"
                >
                  {user ? "My Account" : "Sign In"}
                </Link>
                <Link
                  href="/cart"
                  className="flex-1 text-center rounded-lg border border-coal/15 bg-white px-3 py-3 text-sm font-semibold min-h-[48px]"
                >
                  Bag{cartItemCount > 0 ? ` (${cartItemCount})` : ""}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
