import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Layers, 
  Star, 
  Users, 
  ShieldCheck,
  Menu, 
  LogOut, 
  ArrowLeft, 
  ExternalLink,
  ChevronRight,
  CheckSquare,
  Tags,
  Compass,
  Images,
  LayoutTemplate
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserRoleBanner } from '@/components/admin/UserRoleBanner';

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/admin') return location === '/admin';
    return location.startsWith(href);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navGroups = [
    // Dashboard is restricted only to Super Admin
    ...(isSuperAdmin ? [{
      label: 'Overview',
      items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
    }] : []),
    {
      label: 'Fulfillment',
      items: [
        { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { href: '/admin/my-tasks', label: 'My Tasks', icon: CheckSquare },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/collections', label: 'Collections', icon: Layers },
        { href: '/admin/categories', label: 'Categories', icon: Tags },
        { href: '/admin/carousel', label: 'Edit Carousel', icon: Images },
        { href: '/admin/homepage', label: 'Homepage', icon: LayoutTemplate },
        { href: '/admin/navigation', label: 'Navigation', icon: Compass },
        { href: '/admin/reviews', label: 'Reviews', icon: Star },
      ],
    },
    {
      label: 'People',
      items: [
        // Customers and Team restricted based on Super Admin role
        ...(isSuperAdmin ? [
          { href: '/admin/customers', label: 'Customers', icon: Users },
          { href: '/admin/team', label: 'Team', icon: ShieldCheck }
        ] : []),
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#121110] text-neutral-100 selection:bg-amber-500/20 selection:text-amber-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-neutral-900 border border-[#C5A265]/40 flex items-center justify-center shrink-0">
            <span className="font-serif text-xs font-semibold text-[#C5A265]">AF</span>
          </div>
          <div className="leading-tight">
            <p className="font-serif text-sm tracking-wide font-normal text-white">Attar House Nepal</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#C5A265] font-medium">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                      active
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium shadow-xs'
                        : 'text-neutral-400 border border-transparent hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-amber-400' : 'text-neutral-400 group-hover:text-white'}`} />
                      <span>{label}</span>
                    </div>
                    {active && <ChevronRight className="h-3.5 w-3.5 text-amber-500/80" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-neutral-800/80">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-neutral-800 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/40 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span>Exit to Store</span>
        </Link>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();

  // Safely handle restricted paths for regular ADMIN using useEffect instead of rendering updates
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      if (location === '/admin' || location === '/admin/customers' || location === '/admin/team') {
        setLocation('/admin/orders');
      }
    }
  }, [user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121110]">
        <div className="flex items-center gap-3 text-amber-500 font-mono text-xs uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          Authenticating Session...
        </div>
      </div>
    );
  }

  if (!user) {
    // Google OAuth may be unconfigured on a fresh isolated backend (503).
    // Send unauthenticated visitors to /login (email + Google options) instead.
    window.location.href = "/login?next=/admin";
    return null;
  }

  // Allow both SUPER_ADMIN and ADMIN roles into the console layout
  const hasConsoleAccess = isAdmin || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  if (!hasConsoleAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-neutral-900 px-6">
        <div className="text-center max-w-md bg-white border border-neutral-200/90 rounded-3xl p-8 shadow-xs">
          <h1 className="text-3xl font-serif mb-2">Access Denied</h1>
          <p className="text-neutral-500 font-light text-sm mb-6">
            Your account does not possess engineering or administrative clearance.
          </p>
          <Button asChild className="rounded-full bg-neutral-900 text-white hover:bg-amber-600 font-mono text-xs uppercase tracking-widest px-6 py-2.5 transition-colors">
            <Link href="/">Return to Storefront</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (user.role === 'ADMIN' && (location === '/admin' || location === '/admin/customers' || location === '/admin/team')) {
    return null; // Return null while the effect performs the redirect
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] text-neutral-900 overflow-hidden selection:bg-amber-500/20 selection:text-amber-900">
      {/* Global User Role & Status Banner */}
      <UserRoleBanner user={user} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-neutral-800/20 shadow-xs">
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md shrink-0 z-10">
            <div className="flex items-center gap-3">
              {/* Mobile Sheet Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden rounded-full border-neutral-200/90 hover:bg-neutral-100">
                    <Menu className="h-4 w-4 text-neutral-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-[#121110] border-r border-neutral-800/80 rounded-r-3xl overflow-hidden">
                  <SidebarContent onClose={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
              <span className="font-serif text-lg text-neutral-900 font-normal md:hidden">Maison Console</span>
            </div>

            {/* Action Tools & Profile */}
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200/90 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-mono uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-all shadow-xs"
              >
                <span>Live Store</span>
                <ExternalLink className="h-3 w-3 text-neutral-400" />
              </a>

              <div className="h-4 w-px bg-neutral-200/80 hidden sm:block" />

              {/* Profile Pill */}
              <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200/90 rounded-full py-1 pl-1 pr-3 shadow-xs">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} className="h-7 w-7 rounded-full object-cover ring-1 ring-neutral-300" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-mono font-semibold">
                    {initials}
                  </div>
                )}
                <span className="text-xs font-mono font-medium text-neutral-800 hidden sm:inline-block">{user.name}</span>
              </div>

              {/* Logout Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                title="Logout"
                className="rounded-full hover:bg-red-50 hover:text-red-600 text-neutral-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Page Content Body */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}