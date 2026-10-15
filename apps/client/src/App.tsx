import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from "react";
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Critical first-paint routes: loaded eagerly
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';

// Heavy / secondary routes: code-split to shrink initial bundle (was ~1.4MB)
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));

// Admin bundle (recharts-heavy): fully split from storefront
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCollectionsPage = lazy(() => import('./pages/admin/AdminCollectionsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminCarouselPage = lazy(() => import('./pages/admin/AdminCarouselPage'));
const AdminHomepagePage = lazy(() => import('./pages/admin/AdminHomepagePage'));
const AdminNavigationPage = lazy(() => import('./pages/admin/AdminNavigationPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminCustomerDetailPage = lazy(() => import('./pages/admin/AdminCustomerDetailPage'));
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage'));
const MyTasksPage = lazy(() => import('./pages/admin/MyTasksPage'));

function RouteLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading…
      </div>
    </div>
  );
}

// Retired routes (8848 custom-design feature): redirect to live attar pages.
function RedirectToShop() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/shop", { replace: true });
  }, [navigate]);
  return <RouteLoader />;
}

function PageTransition({ children, transitionKey }: { children: React.ReactNode; transitionKey: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
      transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [location] = useLocation();

  // Pages where Navbar should be completely hidden
  const hideNavbarRoutes = ['/login', '/signup'];
  const isNavbarDisabled = hideNavbarRoutes.includes(location);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  }, [location]);

  if (location.startsWith("/admin")) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Switch>
          <Route path="/admin" component={AdminDashboardPage} />
          <Route path="/admin/orders" component={AdminOrdersPage} />
          <Route path="/admin/orders/:id" component={AdminOrderDetailPage} />
          <Route path="/admin/products" component={AdminProductsPage} />
          <Route path="/admin/collections" component={AdminCollectionsPage} />
          <Route path="/admin/categories" component={AdminCategoriesPage} />
          <Route path="/admin/carousel" component={AdminCarouselPage} />
          <Route path="/admin/homepage" component={AdminHomepagePage} />
          <Route path="/admin/navigation" component={AdminNavigationPage} />
          <Route path="/admin/reviews" component={AdminReviewsPage} />
          <Route path="/admin/customers" component={AdminCustomersPage} />
          <Route path="/admin/customers/:id" component={AdminCustomerDetailPage} />
          <Route path="/admin/team" component={AdminTeamPage} />
          <Route path="/admin/my-tasks" component={MyTasksPage} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed full-width header (Navbar owns announcement + menus + mobile drawer) */}
      {!isNavbarDisabled && <Navbar />}

      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition transitionKey={location}>
            <Suspense fallback={<RouteLoader />}>
              <Switch location={location}>
                <Route path="/" component={HomePage} />
                <Route path="/shop" component={ShopPage} />
                <Route path="/custom-studio" component={RedirectToShop} />
                <Route path="/projects" component={ProjectsPage} />
                <Route path="/projects/:slug" component={ProjectDetailPage} />
                <Route path="/product/:slug" component={ProductDetailPage} />
                <Route path="/collections" component={CollectionsPage} />
                <Route path="/collections/:slug" component={CollectionDetailPage} />
                <Route path="/brands" component={BrandsPage} />
                <Route path="/offers" component={OffersPage} />
                <Route path="/account" component={AccountPage} />
                <Route path="/about" component={AboutPage} />
                <Route path="/contact" component={ContactPage} />
                <Route path="/cart" component={CartPage} />
                <Route path="/checkout" component={CheckoutPage} />
                <Route path="/orders" component={OrdersPage} />
                <Route path="/orders/:id" component={OrderTrackingPage} />
                <Route path="/payment/success" component={PaymentSuccessPage} />
                <Route path="/payment/failed" component={PaymentFailedPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/signup" component={SignupPage} />
                <Route path="/forgot-password" component={ForgotPasswordPage} />
                <Route path="/reset-password" component={ResetPasswordPage} />
                <Route path="/verify-email" component={VerifyEmailPage} />
                <Route path="/privacy-policy" component={PrivacyPolicyPage} />
                <Route path="/terms" component={TermsPage} />
                <Route path="/faq" component={FAQPage} />
                <Route path="/shipping" component={ShippingPage} />
                <Route path="/returns" component={ReturnsPage} />
              </Switch>
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Footer stays rendered on ALL pages including login and signup */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <AppContent />
            </WouterRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
