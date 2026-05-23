import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import MobileDebugger from './components/MobileDebugger';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import useFirebaseNotifications from './hooks/useFirebaseNotifications.jsx';
import { useAuth } from './contexts/AuthContext';
import { useCustomerAuth } from './contexts/CustomerAuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import { GenderProvider } from './contexts/GenderContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { PettyCashProvider } from './contexts/PettyCashContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { CMSProvider } from './contexts/CMSContext';
import { AttendanceProvider } from './contexts/AttendanceContext';
import { BookingRegistryProvider } from './contexts/BookingRegistryContext';

// Loading Component
// Loading Component
const PageLoader = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden" 
       style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)' }}>
    {/* Animated Background Blobs */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full"
      style={{ background: 'radial-gradient(circle, #C8956C 0%, transparent 70%)', filter: 'blur(80px)' }}
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.1, 0.2, 0.1],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full"
      style={{ background: 'radial-gradient(circle, #A06844 0%, transparent 70%)', filter: 'blur(100px)' }}
    />

    <div className="relative z-10 flex flex-col items-center space-y-8">
      {/* Premium Logo / Icon Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#C8956C] to-[#A06844] flex items-center justify-center shadow-2xl shadow-[#C8956C]/20 transform rotate-12">
          <motion.div 
            animate={{ rotate: -12 }} 
            className="w-16 h-16 flex items-center justify-center"
          >
             <span className="text-4xl font-black text-white italic">W</span>
          </motion.div>
        </div>
        
        {/* Orbiting Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-12px] border border-[#C8956C]/30 rounded-full"
          style={{ borderStyle: 'dashed' }}
        />
      </motion.div>

      <div className="flex flex-col items-center space-y-3">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white text-xl font-bold tracking-tight"
          style={{ fontFamily: "'SF Pro Display', sans-serif" }}
        >
          WAPIXO
        </motion.h2>
        
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 rounded-full bg-[#C8956C]"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-[#C8956C]"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="w-1.5 h-1.5 rounded-full bg-[#C8956C]"
          />
        </div>
      </div>
    </div>
  </div>
);

// Public pages - Lazy Loaded
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const AuthPage = lazy(() => import('./pages/auth/AuthPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const BlogPage = lazy(() => import('./pages/landing/BlogPage'));
const BlogPostDetailPage = lazy(() => import('./pages/landing/BlogPostDetailPage'));
const WapixoContactPage = lazy(() => import('./pages/landing/WapixoContactPage'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));
const PanelLaunchpad = lazy(() => import('./pages/PanelLaunchpad'));

// Admin pages - Lazy Loaded
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ClientsPage = lazy(() => import('./pages/admin/ClientsPage'));
const BookingsPage = lazy(() => import('./pages/admin/BookingsPage'));
const ServicesPage = lazy(() => import('./pages/admin/ServicesPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const StaffPage = lazy(() => import('./pages/admin/StaffPage'));
const OutletsPage = lazy(() => import('./pages/admin/OutletsPage'));
const OutletDetailPage = lazy(() => import('./pages/admin/OutletDetailPage'));
const ServiceDetailPage = lazy(() => import('./pages/admin/ServiceDetailPage'));
const OutletForm = lazy(() => import('./components/admin/outlets/OutletForm'));
const CustomersPage = lazy(() => import('./pages/admin/CustomersPage'));
const PromotionsPage = lazy(() => import('./pages/admin/PromotionsPage'));
const InvoicesPage = lazy(() => import('./pages/admin/InvoicesPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const FinancePage = lazy(() => import('./pages/admin/FinancePage'));
const HRPage = lazy(() => import('./pages/admin/HRPage'));
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage'));
const MarketingCMSPage = lazy(() => import('./pages/admin/MarketingCMSPage'));
const MarketingHubPage = lazy(() => import('./pages/admin/MarketingHubPage'));
const LoyaltyMembershipPage = lazy(() => import('./pages/admin/LoyaltyMembershipPage'));
const InquiryPage = lazy(() => import('./pages/admin/InquiryPage'));
const RemindersPage = lazy(() => import('./pages/admin/RemindersPage'));
const PublicCataloguePage = lazy(() => import('./pages/catalogue/PublicCataloguePage'));
const SubscriptionPage = lazy(() => import('./pages/admin/SubscriptionPage'));
const RolesPage = lazy(() => import('./pages/admin/RolesPage'));
const NewBookingPage = lazy(() => import('./pages/admin/NewBookingPage'));
const SupportPage = lazy(() => import('./pages/admin/SupportPage'));
const FeatureLockedPage = lazy(() => import('./pages/admin/FeatureLockedPage'));
const BookingDetailPage = lazy(() => import('./pages/admin/BookingDetailPage'));
const ProductManagementPage = lazy(() => import('./pages/admin/ProductManagementPage'));
const ProductCategoriesPage = lazy(() => import('./pages/admin/ProductCategoriesPage'));
const StockOverviewPage = lazy(() => import('./pages/admin/StockOverviewPage'));
const AddProductPage = lazy(() => import('./pages/admin/AddProductPage'));
const ProductDetailsPage = lazy(() => import('./pages/admin/ProductDetailsPage'));
const ShopOrdersPage = lazy(() => import('./pages/admin/ShopOrdersPage'));
const WhatsAppCreditsPage = lazy(() => import('./pages/admin/WhatsAppCreditsPage'));

// POS App - Lazy Loaded
const POSLayout = lazy(() => import('./layouts/POSLayout'));
const POSBillingPage = lazy(() => import('./pages/pos/POSBillingPage'));
const POSDashboardPage = lazy(() => import('./pages/pos/POSDashboardPage'));
const POSInvoicesPage = lazy(() => import('./pages/pos/POSInvoicesPage'));
const POSPaymentsPage = lazy(() => import('./pages/pos/POSPaymentsPage'));
const POSRefundsPage = lazy(() => import('./pages/pos/POSRefundsPage'));
const POSNotificationsPage = lazy(() => import('./pages/pos/POSNotificationsPage'));
const POSSettingsPage = lazy(() => import('./pages/pos/POSSettingsPage'));

// Super Admin - Lazy Loaded
const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout'));
const SuperAdminLoginPage = lazy(() => import('./pages/superadmin/SuperAdminLoginPage'));
const SADashboardPage = lazy(() => import('./pages/superadmin/SADashboardPage'));
const SATenantsPage = lazy(() => import('./pages/superadmin/SATenantsPage'));
const SATenantDetailPage = lazy(() => import('./pages/superadmin/SATenantDetailPage'));
const SASubscriptionsPage = lazy(() => import('./pages/superadmin/SASubscriptionsPage'));
const SAPlansPage = lazy(() => import('./pages/superadmin/SAPlansPage'));
const SABillingPage = lazy(() => import('./pages/superadmin/SABillingPage'));
const SASettingsPage = lazy(() => import('./pages/superadmin/SASettingsPage'));
const SASupportPage = lazy(() => import('./pages/superadmin/SASupportPage'));
const SAAnalyticsPage = lazy(() => import('./pages/superadmin/SAAnalyticsPage'));
const SAInquiriesPage = lazy(() => import('./pages/superadmin/SAInquiriesPage'));
const SACMSPage = lazy(() => import('./pages/superadmin/SACMSPage'));
const SABlogPage = lazy(() => import('./pages/superadmin/SABlogPage'));

// Customer App - Lazy Loaded
const AppLayout = lazy(() => import('./layouts/AppLayout'));
const AppLoginPage = lazy(() => import('./pages/app/AppLoginPage'));
const AppHomePage = lazy(() => import('./pages/app/AppHomePage'));
const AppWalletPage = lazy(() => import('./pages/app/AppWalletPage'));
const SalonProfilePage = lazy(() => import('./pages/app/SalonProfilePage'));
const AppBookingPage = lazy(() => import('./pages/app/AppBookingPage'));
const AppMyBookingsPage = lazy(() => import('./pages/app/AppMyBookingsPage'));
const AppMyOrdersPage = lazy(() => import('./pages/app/AppMyOrdersPage'));
const AppBookingDetailsPage = lazy(() => import('./pages/app/AppBookingDetailsPage'));
const AppServicesPage = lazy(() => import('./pages/app/AppServicesPage'));
const AppReferralPage = lazy(() => import('./pages/app/AppReferralPage'));
const AppHelpPage = lazy(() => import('./pages/app/AppHelpPage'));
const AppProfilePage = lazy(() => import('./pages/app/AppProfilePage'));
const AppShopPage = lazy(() => import('./pages/app/AppShopPage'));
const AppProductCategoriesPage = lazy(() => import('./pages/app/AppProductCategoriesPage'));
const AppProductDetailsPage = lazy(() => import('./pages/app/AppProductDetailsPage'));
const AppServiceDetailsPage = lazy(() => import('./pages/app/AppServiceDetailsPage'));
const AppCheckoutPage = lazy(() => import('./pages/app/AppCheckoutPage'));
const AppNotificationPage = lazy(() => import('./pages/app/AppNotificationPage'));
const AppLoyaltyPage = lazy(() => import('./pages/app/AppLoyaltyPage'));
import AppLoyaltyHowItWorksPage from './pages/app/AppLoyaltyHowItWorksPage';
const AppMembershipPage = lazy(() => import('./pages/app/AppMembershipPage'));
const AppMembershipCheckoutPage = lazy(() => import('./pages/app/AppMembershipCheckoutPage'));
const AppMembershipSuccessPage = lazy(() => import('./pages/app/AppMembershipSuccessPage'));
const GenderSelectPage = lazy(() => import('./pages/app/GenderSelectPage'));
const AppHelpSupportPage = lazy(() => import('./pages/app/AppHelpSupportPage'));
const AppPrivacyPolicyPage = lazy(() => import('./pages/app/AppPrivacyPolicyPage'));
const AppFavoritesPage = lazy(() => import('./pages/app/AppFavoritesPage'));
const AppExpertsPage = lazy(() => import('./pages/app/AppExpertsPage'));
const NearbyOutletsPage = lazy(() => import('./pages/app/NearbyOutletsPage'));
const AppOrderDetailsPage = lazy(() => import('./pages/app/AppOrderDetailsPage'));
const AppTransactionHistoryPage = lazy(() => import('./pages/app/AppTransactionHistoryPage'));
const AppReviewsPage = lazy(() => import('./pages/app/AppReviewsPage'));
const AppTermsPage = lazy(() => import('./pages/app/AppTermsPage'));
const CustomerAppWrapper = lazy(() => import('./layouts/CustomerAppWrapper'));


// Role-Specific Layouts - Lazy Loaded
const ReceptionistLayout = lazy(() => import('./layouts/ReceptionistLayout'));
const ReceptionistDashboard = lazy(() => import('./pages/receptionist/ReceptionistDashboard'));
const AppointmentsPage = lazy(() => import('./pages/receptionist/AppointmentsPage'));
const QueuePage = lazy(() => import('./pages/receptionist/QueuePage'));
const CheckInPage = lazy(() => import('./pages/receptionist/CheckInPage'));
const ReceptionistInvoicesPage = lazy(() => import('./pages/receptionist/InvoicesPage'));
const PaymentsPage = lazy(() => import('./pages/receptionist/PaymentsPage'));
const ReceptionistSettingsPage = lazy(() => import('./pages/receptionist/ReceptionistSettingsPage'));
const PettyCashPage = lazy(() => import('./pages/accountant/PettyCashPage'));

const StylistLayout = lazy(() => import('./layouts/StylistLayout'));
const StylistDashboard = lazy(() => import('./pages/stylist/StylistDashboard'));
const StylistClientsPage = lazy(() => import('./pages/stylist/StylistClientsPage'));
const StylistCommissionsPage = lazy(() => import('./pages/stylist/StylistCommissionsPage'));
const StylistTimeOffPage = lazy(() => import('./pages/stylist/StylistTimeOffPage'));
const StylistAttendance = lazy(() => import('./pages/stylist/StylistAttendance'));
const StylistSettingsPage = lazy(() => import('./pages/stylist/StylistSettingsPage'));

const AccountantLayout = lazy(() => import('./layouts/AccountantLayout'));
const AccountantDashboard = lazy(() => import('./pages/accountant/AccountantDashboard'));
const RevenuePage = lazy(() => import('./pages/accountant/RevenuePage'));
const ExpensesPage = lazy(() => import('./pages/accountant/ExpensesPage'));
const SupplierInvoicesPage = lazy(() => import('./pages/accountant/SupplierInvoicesPage'));
const PayrollPage = lazy(() => import('./pages/accountant/PayrollPage'));
const TaxPage = lazy(() => import('./pages/accountant/TaxPage'));
const ReconciliationPage = lazy(() => import('./pages/accountant/ReconciliationPage'));
const AccountantSettingsPage = lazy(() => import('./pages/accountant/AccountantSettingsPage'));

const InventoryLayout = lazy(() => import('./layouts/InventoryLayout'));
const InventoryDashboard = lazy(() => import('./pages/inventory/InventoryDashboard'));
const InventoryStockOverview = lazy(() => import('./pages/inventory/StockOverviewPage'));
const PurchasePage = lazy(() => import('./pages/inventory/PurchasePage'));
const StockTransferPage = lazy(() => import('./pages/inventory/StockTransferPage'));
const LowStockAlertsPage = lazy(() => import('./pages/inventory/LowStockAlertsPage'));
const UsageReportsPage = lazy(() => import('./pages/inventory/UsageReportsPage'));
const InventorySettingsPage = lazy(() => import('./pages/inventory/InventorySettingsPage'));

const ManagerLayout = lazy(() => import('./layouts/ManagerLayout'));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const TeamPage = lazy(() => import('./pages/manager/TeamPage'));
const PerformancePage = lazy(() => import('./pages/manager/PerformancePage'));
const AttendancePage = lazy(() => import('./pages/manager/AttendancePage'));
const TargetsPage = lazy(() => import('./pages/manager/TargetsPage'));
const FeedbackPage = lazy(() => import('./pages/manager/FeedbackPage'));
const ShiftsPage = lazy(() => import('./pages/manager/ShiftsPage'));
const ManagerSettingsPage = lazy(() => import('./pages/manager/ManagerSettingsPage'));
const CatalogueEditorPage = lazy(() => import('./pages/manager/CatalogueEditorPage'));
const ServiceApprovalPage = lazy(() => import('./pages/manager/ServiceApprovalPage'));

function ScrollToHash() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    if (state?.noScroll) return;

    const scrollToTop = () => {
      if (hash) {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        // Also target common scroll containers just in case
        const main = document.querySelector('main');
        if (main) main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };

    // Use multiple triggers to ensure it works across different browser rendering timings
    scrollToTop();
    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, [hash, pathname, state]);

  return null;
}

function NotificationHandler() {
  const { isAuthenticated } = useAuth();
  const { isAuthenticated: isCustomerAuthenticated } = useCustomerAuth();
  
  // Initialize notifications for both dashboard users and customer app users
  useFirebaseNotifications(isAuthenticated || isCustomerAuthenticated);
  
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToHash />
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <AuthProvider>
        <CustomerAuthProvider>
          <BusinessProvider>
            <NotificationHandler />
            <WalletProvider>
              <NotificationProvider>
                <CMSProvider>
                <BookingRegistryProvider>
                  <ThemeProvider>
                    <PettyCashProvider>
                      <AttendanceProvider>
                        <FinanceProvider>
                          <InventoryProvider>
                            <CartProvider>
                            <Suspense fallback={<PageLoader />}>
                            <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/register" element={<AuthPage />} />
                        <Route path="/admin/login" element={<AuthPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
                        <Route path="/contact" element={<WapixoContactPage />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/cookies" element={<CookiePolicy />} />
                        <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
                        <Route path="/launchpad" element={<PanelLaunchpad />} />
                        <Route path="/c/:slug" element={<PublicCataloguePage />} />

                        {/* ═══════════════════════════════════════════════════════════
                 ADMIN — Salon Owner Panel
                 ═══════════════════════════════════════════════════════════ */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<DashboardPage />} />
                            <Route path="/admin/outlets" element={<OutletsPage />} />
                            <Route path="/admin/outlets/new" element={<OutletForm />} />
                            <Route path="/admin/outlets/edit/:id" element={<OutletForm />} />
                            <Route path="/admin/outlets/:id" element={<OutletDetailPage />} />
                            <Route path="/admin/setup/roles" element={<RolesPage />} />
                            <Route path="/admin/staff" element={<StaffPage />} />
                            
                            <Route element={<ProtectedRoute permission="bookings" />}>
                                <Route path="/admin/bookings" element={<BookingsPage />} />
                                <Route path="/admin/bookings/:id" element={<BookingDetailPage />} />
                                <Route path="/admin/bookings/new" element={<NewBookingPage />} />
                            </Route>

                            {/* CweRM Routes */}
                            <Route element={<ProtectedRoute feature="crm" permission="crm" />}>
                                <Route path="/admin/crm/customers" element={<CustomersPage tab="directory" />} />
                                <Route path="/admin/crm/wallets" element={<CustomersPage tab="wallets" />} />
                                <Route path="/admin/crm/segments" element={<CustomersPage tab="segments" />} />
                                <Route path="/admin/crm/feedback" element={<CustomersPage tab="feedback" />} />
                                <Route path="/admin/crm/reengage" element={<CustomersPage tab="reengage" />} />
                                <Route path="/admin/crm/payment-reminders" element={<CustomersPage tab="payment-reminders" />} />
                                <Route path="/admin/crm" element={<CustomersPage tab="directory" />} />
                            </Route>
                            <Route path="/admin/clients" element={<ClientsPage />} />

                            {/* Services Routes */}
                            <Route path="/admin/services" element={<ServicesPage tab="list" />} />
                            <Route path="/admin/services/list" element={<ServicesPage tab="list" />} />
                            <Route path="/admin/services/new" element={<ServicesPage tab="add-service" />} />
                            <Route path="/admin/services/edit/:id" element={<ServicesPage tab="edit-service" />} />
                            <Route path="/admin/services/view/:id" element={<ServiceDetailPage />} />
                            <Route path="/admin/services/categories" element={<ServicesPage tab="categories" />} />

                            <Route element={<ProtectedRoute feature="inventory" permission="inventory" />}>
                                <Route path="/admin/products" element={<ProductManagementPage />} />
                                <Route path="/admin/inventory" element={<InventoryPage tab="overview" />} />
                                <Route path="/admin/inventory/overview" element={<InventoryPage tab="overview" />} />
                                <Route path="/admin/inventory/stock-overview" element={<StockOverviewPage />} />
                                <Route path="/admin/inventory/stock-in" element={<InventoryPage tab="stock-in" />} />
                                <Route path="/admin/inventory/adjustment" element={<InventoryPage tab="adjustment" />} />
                                <Route path="/admin/inventory/alerts" element={<InventoryPage tab="alerts" />} />
                                <Route path="/admin/inventory/products" element={<ProductManagementPage />} />
                                <Route path="/admin/inventory/products/new" element={<AddProductPage />} />
                                <Route path="/admin/inventory/products/edit/:id" element={<AddProductPage />} />
                                <Route path="/admin/inventory/products/view/:id" element={<ProductDetailsPage />} />
                                <Route path="/admin/inventory/shop-categories" element={<InventoryPage tab="shop-categories" />} />
                                <Route path="/admin/inventory/product-categories" element={<ProductCategoriesPage />} />
                                <Route path="/admin/shop-orders" element={<ShopOrdersPage />} />
                            </Route>

                            {/* Finance Routes */}
                            <Route element={<ProtectedRoute feature="finance" permission="finance" />}>
                                <Route path="/admin/finance" element={<FinancePage tab="dashboard" />} />
                                <Route path="/admin/finance/dashboard" element={<FinancePage tab="dashboard" />} />
                                <Route path="/admin/finance/transactions" element={<FinancePage tab="transactions" />} />
                                <Route path="/admin/finance/cash-book" element={<FinancePage tab="cash-book" />} />
                                <Route path="/admin/finance/bank-book" element={<FinancePage tab="bank-book" />} />
                                <Route path="/admin/finance/expenses" element={<FinancePage tab="expenses" />} />
                                <Route path="/admin/finance/reports" element={<FinancePage tab="reports" />} />
                                <Route path="/admin/finance/eod" element={<FinancePage tab="eod" />} />
                            </Route>

                            {/* HR Routes */}
                            <Route element={<ProtectedRoute feature="payroll" permission="hr" />}>
                                <Route path="/admin/hr" element={<HRPage tab="staff" />} />
                                <Route path="/admin/hr/staff" element={<HRPage tab="staff" />} />
                                <Route path="/admin/hr/attendance" element={<HRPage tab="attendance" />} />
                                <Route path="/admin/hr/payroll" element={<HRPage tab="payroll" />} />
                                <Route path="/admin/hr/performance" element={<HRPage tab="performance" />} />
                            </Route>

                            <Route path="/admin/promotions" element={<PromotionsPage />} />
                            
                            <Route element={<ProtectedRoute permission="marketing" />}>
                                <Route path="/admin/marketing" element={<MarketingHubPage />} />
                                <Route path="/admin/marketing/cms" element={<MarketingCMSPage />} />
                            </Route>

                            <Route path="/admin/inquiries" element={<InquiryPage />} />
                            <Route path="/admin/reminders" element={<RemindersPage />} />
                            
                            <Route element={<ProtectedRoute permission="loyalty" />}>
                                <Route path="/admin/loyalty" element={<LoyaltyMembershipPage tab="rules" />} />
                                <Route path="/admin/loyalty/rules" element={<LoyaltyMembershipPage tab="rules" />} />
                                <Route path="/admin/loyalty/plans" element={<LoyaltyMembershipPage tab="plans" />} />
                                <Route path="/admin/loyalty/members" element={<LoyaltyMembershipPage tab="members" />} />
                                <Route path="/admin/loyalty/transactions" element={<LoyaltyMembershipPage tab="transactions" />} />
                                <Route path="/admin/loyalty/referral" element={<LoyaltyMembershipPage tab="referral" />} />
                            </Route>
                            <Route path="/admin/invoices" element={<InvoicesPage />} />
                            <Route path="/admin/settings" element={<Navigate to="/admin/settings/profile" replace />} />
                            <Route path="/admin/settings/:section" element={<SettingsPage />} />
                            <Route path="/admin/subscription" element={<SubscriptionPage />} />
                            <Route path="/admin/whatsapp-credits" element={<WhatsAppCreditsPage />} />
                            <Route path="/admin/support" element={<SupportPage />} />
                            <Route path="/admin/feature-locked" element={<FeatureLockedPage />} />
                          </Route>
                        </Route>

                        {/* ═══════════════════════════════════════════════════════════
                 MANAGER — Operations Hub
                 ═══════════════════════════════════════════════════════════ */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<ManagerLayout />}>
                            <Route path="/manager" element={<ManagerDashboard />} />
                            <Route path="/manager/team" element={<TeamPage />} />
                            <Route path="/manager/performance" element={<PerformancePage />} />
                            <Route path="/manager/attendance" element={<AttendancePage />} />
                            <Route path="/manager/targets" element={<TargetsPage />} />
                            <Route path="/manager/feedback" element={<FeedbackPage />} />
                            <Route path="/manager/shifts" element={<ShiftsPage />} />
                            <Route path="/manager/catalogue" element={<CatalogueEditorPage />} />
                            <Route path="/manager/approvals" element={<ServiceApprovalPage />} />
                            <Route path="/manager/settings" element={<ManagerSettingsPage />} />
                            <Route path="/manager/support" element={<SupportPage />} />
                          </Route>
                        </Route>

                        {/* ═══════════════════════════════════════════════════════════
                 RECEPTIONIST — Front Desk
                 ═══════════════════════════════════════════════════════════ */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<ReceptionistLayout />}>
                            <Route path="/receptionist" element={<ReceptionistDashboard />} />
                            <Route path="/receptionist/appointments" element={<AppointmentsPage />} />
                            <Route path="/receptionist/queue" element={<QueuePage />} />
                            <Route path="/receptionist/checkin" element={<CheckInPage />} />
                            <Route path="/receptionist/invoices" element={<ReceptionistInvoicesPage />} />
                            <Route path="/receptionist/payments" element={<PaymentsPage />} />
                            <Route path="/receptionist/petty-cash" element={<PettyCashPage />} />
                            <Route path="/receptionist/settings" element={<ReceptionistSettingsPage />} />
                            <Route path="/receptionist/support" element={<SupportPage />} />
                          </Route>
                        </Route>

                        {/* ═══════════════════════════════════════════════════════════
                 STYLIST — Personal Workspace
                 ═══════════════════════════════════════════════════════════ */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<StylistLayout />}>
                            <Route path="/stylist" element={<StylistDashboard />} />
                            <Route path="/stylist/schedule" element={<Navigate to="/stylist" replace />} />
                            <Route path="/stylist/clients" element={<StylistClientsPage />} />
                            <Route path="/stylist/commissions" element={<StylistCommissionsPage />} />
                            <Route path="/stylist/timeoff" element={<StylistTimeOffPage />} />
                            <Route path="/stylist/attendance" element={<StylistAttendance />} />
                            <Route path="/stylist/settings" element={<StylistSettingsPage />} />
                            <Route path="/stylist/settings/:section" element={<StylistSettingsPage />} />
                            <Route path="/stylist/support" element={<SupportPage />} />
                          </Route>
                        </Route>

                        {/* ═══════════════════════════════════════════════════════════
                 ACCOUNTANT — Finance Panel
                 ═══════════════════════════════════════════════════════════ */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<AccountantLayout />}>
                            <Route path="/accountant" element={<AccountantDashboard />} />
                            <Route path="/accountant/revenue" element={<RevenuePage />} />
                            <Route path="/accountant/expenses" element={<ExpensesPage />} />
                            <Route path="/accountant/invoices" element={<SupplierInvoicesPage />} />
                            <Route path="/accountant/payroll" element={<PayrollPage />} />
                            <Route path="/accountant/petty-cash" element={<PettyCashPage />} />
                            <Route path="/accountant/tax" element={<TaxPage />} />
                            <Route path="/accountant/reconciliation" element={<ReconciliationPage />} />
                            <Route path="/accountant/settings" element={<AccountantSettingsPage />} />
                          </Route>
                        </Route>

                        {/* ═══════════════════════════════════════════════════════════
                 INVENTORY MANAGER — Stock Panel
                   */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<InventoryLayout />}>
                            <Route path="/inventory" element={<InventoryDashboard />} />
                            <Route path="/inventory/stock" element={<InventoryStockOverview />} />
                            <Route path="/inventory/purchase" element={<PurchasePage />} />
                            <Route path="/inventory/transfer" element={<StockTransferPage />} />
                            <Route path="/inventory/alerts" element={<LowStockAlertsPage />} />
                            <Route path="/inventory/reports" element={<UsageReportsPage />} />
                            <Route path="/inventory/settings" element={<InventorySettingsPage />} />
                          </Route>
                        </Route>

                        {/* ═══════════════════════════════════════════════════════════
                 SUPER ADMIN — SaaS Owner
                 ═══════════════════════════════════════════════════════════ */}
                        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                          <Route element={<SuperAdminLayout />}>
                            <Route path="/superadmin" element={<SADashboardPage />} />
                            <Route path="/superadminpanel" element={<SADashboardPage />} />
                            <Route path="/superadmin/tenants" element={<SATenantsPage />} />
                            <Route path="/superadmin/tenants/:id" element={<SATenantDetailPage />} />
                            <Route path="/superadmin/subscriptions" element={<SASubscriptionsPage />} />
                            <Route path="/superadmin/plans" element={<SAPlansPage />} />
                            <Route path="/superadmin/billing" element={<SABillingPage />} />
                            <Route path="/superadmin/analytics" element={<SAAnalyticsPage />} />
                            <Route path="/superadmin/cms" element={<SACMSPage />} />
                            <Route path="/superadmin/blogs" element={<SABlogPage />} />
                            <Route path="/superadmin/settings" element={<SASettingsPage />} />
                            <Route path="/superadmin/support" element={<SASupportPage />} />
                            <Route path="/superadmin/inquiries" element={<SAInquiriesPage />} />
                            <Route path="/superadmin/marketing/cms" element={<MarketingCMSPage />} />
                          </Route>
                        </Route>

                        <Route element={<ProtectedRoute feature="pos" permission="pos" />}>
                          <Route element={<POSLayout />}>
                            <Route path="/pos" element={<POSDashboardPage />} />
                            <Route path="/pos/billing" element={<POSBillingPage />} />
                            <Route path="/pos/invoices" element={<POSInvoicesPage />} />
                            <Route path="/pos/payments" element={<POSPaymentsPage />} />
                            <Route path="/pos/refunds" element={<POSRefundsPage />} />
                            <Route path="/pos/notifications" element={<POSNotificationsPage />} />
                            <Route path="/pos/settings" element={<POSSettingsPage />} />
                          </Route>
                        </Route>

                        {/* ═══════════════════════════════════════════════════════════
                 CUSTOMER APP — Mobile-First Experience
                 ═══════════════════════════════════════════════════════════ */}
                        <Route element={<CustomerAppWrapper />}>
                          <Route path="/app/login" element={<AppLoginPage />} />
                          <Route path="/app/gender" element={<GenderSelectPage />} />
                          <Route element={<AppLayout />}>
                            <Route path="/app" element={<AppHomePage />} />
                            <Route path="/app/nearby-outlets" element={<NearbyOutletsPage />} />
                            <Route path="/app/salon/:id" element={<SalonProfilePage />} />
                            <Route path="/app/wallet" element={<AppWalletPage />} />
                            <Route path="/app/transactions" element={<AppTransactionHistoryPage />} />
                            <Route path="/app/reviews" element={<AppReviewsPage />} />
                            <Route path="/app/help" element={<AppHelpPage />} />
                            <Route path="/app/likes" element={<AppFavoritesPage />} />

                            <Route path="/app/booking" element={<AppBookingPage />} />
                            <Route path="/app/experts" element={<AppExpertsPage />} />
                            <Route path="/app/services" element={<AppServicesPage />} />
                            <Route path="/app/service/:id" element={<AppServiceDetailsPage />} />
                            <Route path="/app/bookings" element={<AppMyBookingsPage />} />
                            <Route path="/app/bookings/:id" element={<AppBookingDetailsPage />} />
                            <Route path="/app/orders" element={<AppMyOrdersPage />} />
                            <Route path="/app/orders/:id" element={<AppOrderDetailsPage />} />
                            <Route path="/app/referrals" element={<AppReferralPage />} />
                            <Route path="/app/profile" element={<AppProfilePage />} />
                            <Route path="/app/shop" element={<AppShopPage />} />
                            <Route path="/app/categories" element={<AppProductCategoriesPage />} />
                            <Route path="/app/product/:id" element={<AppProductDetailsPage />} />
                            <Route path="/app/checkout" element={<AppCheckoutPage />} />
                            <Route path="/app/notifications" element={<AppNotificationPage />} />
                            <Route path="/app/loyalty-how-it-works" element={<AppLoyaltyHowItWorksPage />} />
                            <Route path="/app/loyalty" element={<AppLoyaltyPage />} />
                            <Route path="/app/membership" element={<AppMembershipPage />} />
                            <Route path="/app/membership/checkout" element={<AppMembershipCheckoutPage />} />
                            <Route path="/app/membership/success" element={<AppMembershipSuccessPage />} />
                          </Route>
                          
                          <Route path="/app/privacy" element={<AppPrivacyPolicyPage />} />
                          <Route path="/app/terms" element={<AppTermsPage />} />
                        </Route>

                        {/* 
                 ERROR PAGES
                 ═══════════════════════════════════════════════════════════ */}
                        <Route path="/unauthorized" element={
                          <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center selection:bg-primary/30">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-6"
                            >
                              <h1 className="text-8xl font-black text-primary/20 leading-none">403</h1>
                              <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-text uppercase tracking-widest italic">Access Refused.</h2>
                                <p className="text-text-secondary max-w-xs mx-auto text-sm font-medium">You don't have the required protocols to access this sector.</p>
                              </div>
                              <button onClick={() => window.location.href = '/login'} className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-none hover:bg-white hover:text-black transition-all">Go to Login</button>
                            </motion.div>
                          </div>
                        } />

                            <Route path="*" element={
                              <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center selection:bg-primary/30">
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="space-y-6"
                                >
                                  <h1 className="text-8xl font-black text-primary/20 leading-none">404</h1>
                                  <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest italic">Lost in Orbit.</h2>
                                    <p className="text-text-secondary max-w-xs mx-auto text-sm font-medium">The coordinates you're looking for do not exist in this system.</p>
                                  </div>
                                  <button onClick={() => window.location.href = '/login'} className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-none hover:bg-white hover:text-black transition-all">Go to Login</button>
                                </motion.div>
                              </div>
                            } />
                          </Routes>
                          </Suspense>
                          </CartProvider>
                          </InventoryProvider>
                        </FinanceProvider>
                      </AttendanceProvider>
                    </PettyCashProvider>
                  </ThemeProvider>
                </BookingRegistryProvider>
              </CMSProvider>
              </NotificationProvider>
            </WalletProvider>
          </BusinessProvider>
        </CustomerAuthProvider>
      </AuthProvider>

      {/* <MobileDebugger /> */}
    </Router>
  );
}

export default App;
