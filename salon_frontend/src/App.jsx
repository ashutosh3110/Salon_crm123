import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

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

// Admin layout & pages
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ClientsPage from './pages/admin/ClientsPage';
import BookingsPage from './pages/admin/BookingsPage';
import ServicesPage from './pages/admin/ServicesPage';
import ProductsPage from './pages/admin/ProductsPage';
import OutletsPage from './pages/admin/OutletsPage';
import StaffPage from './pages/admin/StaffPage';
import CustomersPage from './pages/admin/CustomersPage';
import PromotionsPage from './pages/admin/PromotionsPage';
import LoyaltyPage from './pages/admin/LoyaltyPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import SettingsPage from './pages/admin/SettingsPage';
import FinancePage from './pages/admin/FinancePage';
import HRPage from './pages/admin/HRPage';
import OutletForm from './components/admin/outlets/OutletForm';
import OutletDetailPage from './pages/admin/OutletDetailPage';
import InventoryPage from './pages/admin/InventoryPage';

// POS App (standalone)
import POSLayout from './layouts/POSLayout';
import POSBillingPage from './pages/pos/POSBillingPage';
import POSDashboardPage from './pages/pos/POSDashboardPage';
import POSInvoicesPage from './pages/pos/POSInvoicesPage';
import POSPaymentsPage from './pages/pos/POSPaymentsPage';
import POSRefundsPage from './pages/pos/POSRefundsPage';
import POSSettingsPage from './pages/pos/POSSettingsPage';
import POSDayEndPage from './pages/pos/POSDayEndPage';
import POSNotificationsPage from './pages/pos/POSNotificationsPage';

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
import SAContentPage from './pages/superadmin/SAContentPage';
import SAInquiriesPage from './pages/superadmin/SAInquiriesPage';

// Customer App layout & pages
import AppLayout from './layouts/AppLayout';
import AppLoginPage from './pages/app/AppLoginPage';
import AppHomePage from './pages/app/AppHomePage';
import AppServicesPage from './pages/app/AppServicesPage';
import AppBookingPage from './pages/app/AppBookingPage';
import AppMyBookingsPage from './pages/app/AppMyBookingsPage';
import AppReferralPage from './pages/app/AppReferralPage';
import AppProfilePage from './pages/app/AppProfilePage';
import AppShopPage from './pages/app/AppShopPage';
import AppProductCategoriesPage from './pages/app/AppProductCategoriesPage';
import AppProductDetailsPage from './pages/app/AppProductDetailsPage';
import AppNotificationPage from './pages/app/AppNotificationPage';
import GenderSelectPage from './pages/app/GenderSelectPage';
import { CartProvider } from './contexts/CartContext';
import { GenderProvider } from './contexts/GenderContext';

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
import StylistGalleryPage from './pages/stylist/StylistGalleryPage';
import StylistTimeOffPage from './pages/stylist/StylistTimeOffPage';
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

function App() {
  return (
    <Router>
      <ScrollToHash />
      <AuthProvider>
        <BusinessProvider>
          <ThemeProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/admin/login" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostDetailPage />} />
              <Route path="/contact" element={<WapixoContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />

              {/* ═══════════════════════════════════════════════════════════
                 ADMIN — Salon Owner Panel
                 ═══════════════════════════════════════════════════════════ */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<DashboardPage />} />
                  <Route path="/admin/outlets" element={<OutletsPage />} />
                  <Route path="/admin/outlets/new" element={<OutletForm />} />
                  <Route path="/admin/outlets/edit/:id" element={<OutletForm />} />
                  <Route path="/admin/outlets/:id" element={<OutletDetailPage />} />
                  <Route path="/admin/staff" element={<StaffPage />} />
                  <Route path="/admin/bookings" element={<BookingsPage />} />

                  {/* CRM Routes */}
                  <Route path="/admin/crm/customers" element={<CustomersPage tab="directory" />} />
                  <Route path="/admin/crm/segments" element={<CustomersPage tab="segments" />} />
                  <Route path="/admin/crm/feedback" element={<CustomersPage tab="feedback" />} />
                  <Route path="/admin/crm/reengage" element={<CustomersPage tab="reengage" />} />
                  <Route path="/admin/crm" element={<CustomersPage tab="directory" />} />
                  <Route path="/admin/clients" element={<ClientsPage />} />

                  {/* Services Routes */}
                  <Route path="/admin/services" element={<ServicesPage tab="list" />} />
                  <Route path="/admin/services/list" element={<ServicesPage tab="list" />} />
                  <Route path="/admin/services/new" element={<ServicesPage tab="add-service" />} />
                  <Route path="/admin/services/edit/:id" element={<ServicesPage tab="edit-service" />} />
                  <Route path="/admin/services/categories" element={<ServicesPage tab="categories" />} />

                  <Route path="/admin/products" element={<ProductsPage />} />

                  {/* Inventory Routes */}
                  <Route path="/admin/inventory" element={<InventoryPage tab="overview" />} />
                  <Route path="/admin/inventory/overview" element={<InventoryPage tab="overview" />} />
                  <Route path="/admin/inventory/stock-in" element={<InventoryPage tab="stock-in" />} />
                  <Route path="/admin/inventory/adjustment" element={<InventoryPage tab="adjustment" />} />
                  <Route path="/admin/inventory/alerts" element={<InventoryPage tab="alerts" />} />
                  <Route path="/admin/inventory/products" element={<InventoryPage tab="products" />} />
                  <Route path="/admin/inventory/products/new" element={<InventoryPage tab="add-product" />} />

                  {/* Finance Routes */}
                  <Route path="/admin/finance" element={<FinancePage tab="dashboard" />} />
                  <Route path="/admin/finance/dashboard" element={<FinancePage tab="dashboard" />} />
                  <Route path="/admin/finance/suppliers" element={<FinancePage tab="suppliers" />} />
                  <Route path="/admin/finance/invoices" element={<FinancePage tab="invoices" />} />
                  <Route path="/admin/finance/expenses" element={<FinancePage tab="expenses" />} />
                  <Route path="/admin/finance/reconciliation" element={<FinancePage tab="reconciliation" />} />
                  <Route path="/admin/finance/tax" element={<FinancePage tab="tax" />} />
                  <Route path="/admin/finance/eod" element={<FinancePage tab="eod" />} />

                  {/* HR Routes */}
                  <Route path="/admin/hr" element={<HRPage tab="staff" />} />
                  <Route path="/admin/hr/staff" element={<HRPage tab="staff" />} />
                  <Route path="/admin/hr/attendance" element={<HRPage tab="attendance" />} />
                  <Route path="/admin/hr/shifts" element={<HRPage tab="shifts" />} />
                  <Route path="/admin/hr/payroll" element={<HRPage tab="payroll" />} />
                  <Route path="/admin/hr/performance" element={<HRPage tab="performance" />} />

                  <Route path="/admin/promotions" element={<PromotionsPage />} />
                  <Route path="/admin/loyalty" element={<LoyaltyPage />} />
                  <Route path="/admin/invoices" element={<InvoicesPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />}>
                    <Route path="profile" element={<SettingsPage tab="profile" />} />
                    <Route path="notifications" element={<SettingsPage tab="notifications" />} />
                    <Route path="security" element={<SettingsPage tab="security" />} />
                  </Route>
                </Route>
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                 MANAGER — Operations Hub
                 ═══════════════════════════════════════════════════════════ */}
              <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
                <Route element={<ManagerLayout />}>
                  <Route path="/manager" element={<ManagerDashboard />} />
                  <Route path="/manager/team" element={<TeamPage />} />
                  <Route path="/manager/performance" element={<PerformancePage />} />
                  <Route path="/manager/attendance" element={<AttendancePage />} />
                  <Route path="/manager/targets" element={<TargetsPage />} />
                  <Route path="/manager/feedback" element={<FeedbackPage />} />
                  <Route path="/manager/shifts" element={<ShiftsPage />} />
                  <Route path="/manager/settings" element={<ManagerSettingsPage />} />
                </Route>
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                 RECEPTIONIST — Front Desk
                 ═══════════════════════════════════════════════════════════ */}
              <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
                <Route element={<ReceptionistLayout />}>
                  <Route path="/receptionist" element={<ReceptionistDashboard />} />
                  <Route path="/receptionist/appointments" element={<AppointmentsPage />} />
                  <Route path="/receptionist/queue" element={<QueuePage />} />
                  <Route path="/receptionist/checkin" element={<CheckInPage />} />
                  <Route path="/receptionist/invoices" element={<ReceptionistInvoicesPage />} />
                  <Route path="/receptionist/payments" element={<PaymentsPage />} />
                  <Route path="/receptionist/settings" element={<ReceptionistSettingsPage />} />
                </Route>
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                 STYLIST — Personal Workspace
                 ═══════════════════════════════════════════════════════════ */}
              <Route element={<ProtectedRoute allowedRoles={['stylist']} />}>
                <Route element={<StylistLayout />}>
                  <Route path="/stylist" element={<StylistDashboard />} />
                  <Route path="/stylist/clients" element={<StylistClientsPage />} />
                  <Route path="/stylist/commissions" element={<StylistCommissionsPage />} />
                  <Route path="/stylist/gallery" element={<StylistGalleryPage />} />
                  <Route path="/stylist/timeoff" element={<StylistTimeOffPage />} />
                  <Route path="/stylist/settings" element={<StylistSettingsPage />} />
                  <Route path="/stylist/settings/:section" element={<StylistSettingsPage />} />
                </Route>
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                 ACCOUNTANT — Finance Panel
                 ═══════════════════════════════════════════════════════════ */}
              <Route element={<ProtectedRoute allowedRoles={['accountant']} />}>
                <Route element={<AccountantLayout />}>
                  <Route path="/accountant" element={<AccountantDashboard />} />
                  <Route path="/accountant/revenue" element={<RevenuePage />} />
                  <Route path="/accountant/expenses" element={<ExpensesPage />} />
                  <Route path="/accountant/invoices" element={<SupplierInvoicesPage />} />
                  <Route path="/accountant/payroll" element={<PayrollPage />} />
                  <Route path="/accountant/tax" element={<TaxPage />} />
                  <Route path="/accountant/reconciliation" element={<ReconciliationPage />} />
                  <Route path="/accountant/settings" element={<AccountantSettingsPage />} />
                </Route>
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                 INVENTORY MANAGER — Stock Panel
                 ═══════════════════════════════════════════════════════════ */}
              <Route element={<ProtectedRoute allowedRoles={['inventory_manager']} />}>
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
                  <Route path="/superadmin/tenants" element={<SATenantsPage />} />
                  <Route path="/superadmin/tenants/:id" element={<SATenantDetailPage />} />
                  <Route path="/superadmin/subscriptions" element={<SASubscriptionsPage />} />
                  <Route path="/superadmin/plans" element={<SAPlansPage />} />
                  <Route path="/superadmin/billing" element={<SABillingPage />} />
                  <Route path="/superadmin/analytics" element={<SAAnalyticsPage />} />
                  <Route path="/superadmin/settings" element={<SASettingsPage />} />
                  <Route path="/superadmin/support" element={<SASupportPage />} />
                  <Route path="/superadmin/content" element={<SAContentPage />} />
                  <Route path="/superadmin/inquiries" element={<SAInquiriesPage />} />
                </Route>
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                 POS — Point of Sale (shared by admin, manager, receptionist)
                 ═══════════════════════════════════════════════════════════ */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist']} />}>
                <Route element={<POSLayout />}>
                  <Route path="/pos" element={<POSDashboardPage />} />
                  <Route path="/pos/billing" element={<POSBillingPage />} />
                  <Route path="/pos/invoices" element={<POSInvoicesPage />} />
                  <Route path="/pos/payments" element={<POSPaymentsPage />} />
                  <Route path="/pos/refunds" element={<POSRefundsPage />} />
                  <Route path="/pos/notifications" element={<POSNotificationsPage />} />
                  <Route path="/pos/day-end" element={<POSDayEndPage />} />
                  <Route path="/pos/settings" element={<POSSettingsPage />} />
                </Route>
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                 CUSTOMER APP — Mobile-First Experience
                 ═══════════════════════════════════════════════════════════ */}
              <Route element={
                <CustomerAuthProvider>
                  <GenderProvider>
                    <CartProvider>
                      <Outlet />
                    </CartProvider>
                  </GenderProvider>
                </CustomerAuthProvider>
              }>
                <Route path="/app/login" element={<AppLoginPage />} />
                <Route path="/app/gender" element={<GenderSelectPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/app" element={<AppHomePage />} />
                  <Route path="/app/services" element={<AppServicesPage />} />
                  <Route path="/app/book" element={<AppBookingPage />} />
                  <Route path="/app/bookings" element={<AppMyBookingsPage />} />
                  <Route path="/app/referrals" element={<AppReferralPage />} />
                  <Route path="/app/profile" element={<AppProfilePage />} />
                  <Route path="/app/shop" element={<AppShopPage />} />
                  <Route path="/app/categories" element={<AppProductCategoriesPage />} />
                  <Route path="/app/product/:id" element={<AppProductDetailsPage />} />
                  <Route path="/app/notifications" element={<AppNotificationPage />} />
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
          </ThemeProvider>
        </BusinessProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
