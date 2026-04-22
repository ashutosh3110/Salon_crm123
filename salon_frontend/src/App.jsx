import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
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

// Public pages
import LandingPage from './pages/landing/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import BlogPage from './pages/landing/BlogPage';
import BlogPostDetailPage from './pages/landing/BlogPostDetailPage';
import WapixoContactPage from './pages/landing/WapixoContactPage';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import PanelLaunchpad from './pages/PanelLaunchpad';

// Admin layout & pages
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ClientsPage from './pages/admin/ClientsPage';
import BookingsPage from './pages/admin/BookingsPage';
import ServicesPage from './pages/admin/ServicesPage';
import ProductsPage from './pages/admin/ProductsPage';
import StaffPage from './pages/admin/StaffPage';
import OutletsPage from './pages/admin/OutletsPage';
import OutletDetailPage from './pages/admin/OutletDetailPage';
import ServiceDetailPage from './pages/admin/ServiceDetailPage';
import OutletForm from './components/admin/outlets/OutletForm';
import CustomersPage from './pages/admin/CustomersPage';
import PromotionsPage from './pages/admin/PromotionsPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import SettingsPage from './pages/admin/SettingsPage';
import FinancePage from './pages/admin/FinancePage';
import HRPage from './pages/admin/HRPage';
import InventoryPage from './pages/admin/InventoryPage';
import MarketingCMSPage from './pages/admin/MarketingCMSPage';
import MarketingHubPage from './pages/admin/MarketingHubPage';
import LoyaltyMembershipPage from './pages/admin/LoyaltyMembershipPage';
import InquiryPage from './pages/admin/InquiryPage';
import RemindersPage from './pages/admin/RemindersPage';
import PublicCataloguePage from './pages/catalogue/PublicCataloguePage';
import SubscriptionPage from './pages/admin/SubscriptionPage';
import RolesPage from './pages/admin/RolesPage';
import NewBookingPage from './pages/admin/NewBookingPage';
import SupportPage from './pages/admin/SupportPage';
import FeatureLockedPage from './pages/admin/FeatureLockedPage';
import BookingDetailPage from './pages/admin/BookingDetailPage';

// POS App (standalone)
import POSLayout from './layouts/POSLayout';
import POSBillingPage from './pages/pos/POSBillingPage';
import POSDashboardPage from './pages/pos/POSDashboardPage';
import POSInvoicesPage from './pages/pos/POSInvoicesPage';
import POSPaymentsPage from './pages/pos/POSPaymentsPage';
import POSRefundsPage from './pages/pos/POSRefundsPage';
import POSNotificationsPage from './pages/pos/POSNotificationsPage';
import POSSettingsPage from './pages/pos/POSSettingsPage';

// Super Admin layout & pages
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminLoginPage from './pages/superadmin/SuperAdminLoginPage';
import SADashboardPage from './pages/superadmin/SADashboardPage';
import SATenantsPage from './pages/superadmin/SATenantsPage';
import SATenantDetailPage from './pages/superadmin/SATenantDetailPage';
import SASubscriptionsPage from './pages/superadmin/SASubscriptionsPage';
import SAPlansPage from './pages/superadmin/SAPlansPage';
import SABillingPage from './pages/superadmin/SABillingPage';
import SASettingsPage from './pages/superadmin/SASettingsPage';
import SASupportPage from './pages/superadmin/SASupportPage';
import SAAnalyticsPage from './pages/superadmin/SAAnalyticsPage';
import SAInquiriesPage from './pages/superadmin/SAInquiriesPage';
import SACMSPage from './pages/superadmin/SACMSPage';
import SABlogPage from './pages/superadmin/SABlogPage';

// Customer App layout & pages
import AppLayout from './layouts/AppLayout';
import AppLoginPage from './pages/app/AppLoginPage';
import AppHomePage from './pages/app/AppHomePage';
import AppWalletPage from './pages/app/AppWalletPage';
import AppDiscoveryPage from './pages/app/AppDiscoveryPage';
import SalonProfilePage from './pages/app/SalonProfilePage';

import AppBookingPage from './pages/app/AppBookingPage';
import AppMyBookingsPage from './pages/app/AppMyBookingsPage';
import AppMyOrdersPage from './pages/app/AppMyOrdersPage';
import AppBookingDetailsPage from './pages/app/AppBookingDetailsPage';
import AppServicesPage from './pages/app/AppServicesPage';
import AppReferralPage from './pages/app/AppReferralPage';
import AppProfilePage from './pages/app/AppProfilePage';
import AppShopPage from './pages/app/AppShopPage';
import AppProductCategoriesPage from './pages/app/AppProductCategoriesPage';
import AppProductDetailsPage from './pages/app/AppProductDetailsPage';
import AppServiceDetailsPage from './pages/app/AppServiceDetailsPage';
import AppCheckoutPage from './pages/app/AppCheckoutPage';
import AppNotificationPage from './pages/app/AppNotificationPage';
import AppLoyaltyPage from './pages/app/AppLoyaltyPage';
import AppMembershipPage from './pages/app/AppMembershipPage';
import AppMembershipCheckoutPage from './pages/app/AppMembershipCheckoutPage';
import AppMembershipSuccessPage from './pages/app/AppMembershipSuccessPage';
import GenderSelectPage from './pages/app/GenderSelectPage';
import AppHelpSupportPage from './pages/app/AppHelpSupportPage';
import AppPrivacyPolicyPage from './pages/app/AppPrivacyPolicyPage';
import AppFavoritesPage from './pages/app/AppFavoritesPage';
import SalonSelectionPage from './pages/app/SalonSelectionPage';
import AppExpertsPage from './pages/app/AppExpertsPage';
import NearbyOutletsPage from './pages/app/NearbyOutletsPage';
import AppOrderDetailsPage from './pages/app/AppOrderDetailsPage';
import AppTransactionHistoryPage from './pages/app/AppTransactionHistoryPage';
import { CartProvider } from './contexts/CartContext';
import { GenderProvider } from './contexts/GenderContext';
import CustomerAppWrapper from './layouts/CustomerAppWrapper';
import { InventoryProvider } from './contexts/InventoryContext';
import { PettyCashProvider } from './contexts/PettyCashContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { CMSProvider } from './contexts/CMSContext';
import { AttendanceProvider } from './contexts/AttendanceContext';


function ScrollToHash() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    if (state?.noScroll) return;

    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
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

// Role-Specific Layouts & Dashboards
import ReceptionistLayout from './layouts/ReceptionistLayout';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import AppointmentsPage from './pages/receptionist/AppointmentsPage';
import QueuePage from './pages/receptionist/QueuePage';
import CheckInPage from './pages/receptionist/CheckInPage';
import ReceptionistInvoicesPage from './pages/receptionist/InvoicesPage';
import PaymentsPage from './pages/receptionist/PaymentsPage';
import ReceptionistSettingsPage from './pages/receptionist/ReceptionistSettingsPage';

import StylistLayout from './layouts/StylistLayout';
import StylistDashboard from './pages/stylist/StylistDashboard';
import StylistClientsPage from './pages/stylist/StylistClientsPage';
import StylistCommissionsPage from './pages/stylist/StylistCommissionsPage';
import StylistTimeOffPage from './pages/stylist/StylistTimeOffPage';
import StylistAttendance from './pages/stylist/StylistAttendance';
import StylistSettingsPage from './pages/stylist/StylistSettingsPage';

import AccountantLayout from './layouts/AccountantLayout';
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import RevenuePage from './pages/accountant/RevenuePage';
import ExpensesPage from './pages/accountant/ExpensesPage';
import SupplierInvoicesPage from './pages/accountant/SupplierInvoicesPage';
import PayrollPage from './pages/accountant/PayrollPage';
import TaxPage from './pages/accountant/TaxPage';
import ReconciliationPage from './pages/accountant/ReconciliationPage';
import AccountantSettingsPage from './pages/accountant/AccountantSettingsPage';
import PettyCashPage from './pages/accountant/PettyCashPage';

import InventoryLayout from './layouts/InventoryLayout';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import StockOverviewPage from './pages/inventory/StockOverviewPage';
import PurchasePage from './pages/inventory/PurchasePage';
import StockTransferPage from './pages/inventory/StockTransferPage';
import LowStockAlertsPage from './pages/inventory/LowStockAlertsPage';
import UsageReportsPage from './pages/inventory/UsageReportsPage';
import InventorySettingsPage from './pages/inventory/InventorySettingsPage';

import ManagerLayout from './layouts/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamPage from './pages/manager/TeamPage';
import PerformancePage from './pages/manager/PerformancePage';
import AttendancePage from './pages/manager/AttendancePage';
import TargetsPage from './pages/manager/TargetsPage';
import FeedbackPage from './pages/manager/FeedbackPage';
import ShiftsPage from './pages/manager/ShiftsPage';
import ManagerSettingsPage from './pages/manager/ManagerSettingsPage';
import CatalogueEditorPage from './pages/manager/CatalogueEditorPage';
import ServiceApprovalPage from './pages/manager/ServiceApprovalPage';

import { BookingRegistryProvider } from './contexts/BookingRegistryContext';

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
          <NotificationHandler />
          <BusinessProvider>
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

                            {/* CRM Routes */}
                            <Route element={<ProtectedRoute feature="crm" permission="crm" />}>
                                <Route path="/admin/crm/customers" element={<CustomersPage tab="directory" />} />
                                <Route path="/admin/crm/wallets" element={<CustomersPage tab="wallets" />} />
                                <Route path="/admin/crm/segments" element={<CustomersPage tab="segments" />} />
                                <Route path="/admin/crm/feedback" element={<CustomersPage tab="feedback" />} />
                                <Route path="/admin/crm/reengage" element={<CustomersPage tab="reengage" />} />
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
                                <Route path="/admin/products" element={<ProductsPage />} />
                                <Route path="/admin/inventory" element={<InventoryPage tab="overview" />} />
                                <Route path="/admin/inventory/overview" element={<InventoryPage tab="overview" />} />
                                <Route path="/admin/inventory/stock-overview" element={<InventoryPage tab="stock-overview" />} />
                                <Route path="/admin/inventory/stock-in" element={<InventoryPage tab="stock-in" />} />
                                <Route path="/admin/inventory/adjustment" element={<InventoryPage tab="adjustment" />} />
                                <Route path="/admin/inventory/alerts" element={<InventoryPage tab="alerts" />} />
                                <Route path="/admin/inventory/products" element={<InventoryPage tab="products" />} />
                                <Route path="/admin/inventory/products/new" element={<InventoryPage tab="add-product" />} />
                                <Route path="/admin/inventory/shop-categories" element={<InventoryPage tab="shop-categories" />} />
                                <Route path="/admin/inventory/product-categories" element={<InventoryPage tab="product-categories" />} />
                            </Route>

                            {/* Finance Routes */}
                            <Route element={<ProtectedRoute feature="finance" permission="finance" />}>
                                <Route path="/admin/finance" element={<FinancePage tab="dashboard" />} />
                                <Route path="/admin/finance/dashboard" element={<FinancePage tab="dashboard" />} />
                                <Route path="/admin/finance/suppliers" element={<FinancePage tab="suppliers" />} />
                                <Route path="/admin/finance/invoices" element={<FinancePage tab="invoices" />} />
                                <Route path="/admin/finance/expenses" element={<FinancePage tab="expenses" />} />
                                <Route path="/admin/finance/petty-cash" element={<FinancePage tab="petty-cash" />} />
                                <Route path="/admin/finance/reconciliation" element={<FinancePage tab="reconciliation" />} />
                                <Route path="/admin/finance/tax" element={<FinancePage tab="tax" />} />
                                <Route path="/admin/finance/eod" element={<FinancePage tab="eod" />} />
                            </Route>

                            {/* HR Routes */}
                            <Route element={<ProtectedRoute feature="payroll" permission="hr" />}>
                                <Route path="/admin/hr" element={<HRPage tab="staff" />} />
                                <Route path="/admin/hr/staff" element={<HRPage tab="staff" />} />
                                <Route path="/admin/hr/attendance" element={<HRPage tab="attendance" />} />
                                <Route path="/admin/hr/shifts" element={<HRPage tab="shifts" />} />
                                <Route path="/admin/hr/payroll" element={<HRPage tab="payroll" />} />
                                <Route path="/admin/hr/performance" element={<HRPage tab="performance" />} />
                                <Route path="/admin/hr/leaves" element={<HRPage tab="leaves" />} />
                                <Route path="/admin/hr/approvals" element={<HRPage tab="approvals" />} />
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
                            <Route path="/inventory/stock" element={<StockOverviewPage />} />
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
                            <Route path="/app/select-salon" element={<SalonSelectionPage />} />
                            <Route path="/app/nearby-outlets" element={<NearbyOutletsPage />} />
                            <Route path="/app/salon/:id" element={<SalonProfilePage />} />
                            <Route path="/app/discovery" element={<AppDiscoveryPage />} />
                            <Route path="/app/wallet" element={<AppWalletPage />} />
                            <Route path="/app/transactions" element={<AppTransactionHistoryPage />} />
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
                            <Route path="/app/loyalty" element={<AppLoyaltyPage />} />
                            <Route path="/app/membership" element={<AppMembershipPage />} />
                            <Route path="/app/membership/checkout" element={<AppMembershipCheckoutPage />} />
                            <Route path="/app/membership/success" element={<AppMembershipSuccessPage />} />
                            <Route path="/app/help" element={<AppHelpSupportPage />} />
                            <Route path="/app/privacy" element={<AppPrivacyPolicyPage />} />
                          </Route>
                        </Route>

                        {/* ═══════════════════════════════════════════════════════════
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

    </Router>
  );
}

export default App;
