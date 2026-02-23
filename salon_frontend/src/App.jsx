import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';

// Public pages
// ... (lines 5-41 remain same)
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BlogPage from './pages/landing/BlogPage';
import BlogPostDetailPage from './pages/landing/BlogPostDetailPage';
import ContactFullPage from './pages/landing/ContactFullPage';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Contexts
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

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
// POS App (standalone)
import POSLayout from './layouts/POSLayout';
import POSBillingPage from './pages/pos/POSBillingPage';
import POSDashboardPage from './pages/pos/POSDashboardPage';
import POSInvoicesPage from './pages/pos/POSInvoicesPage';
import POSPaymentsPage from './pages/pos/POSPaymentsPage';
import POSRefundsPage from './pages/pos/POSRefundsPage';
import POSSettingsPage from './pages/pos/POSSettingsPage';
import PromotionsPage from './pages/admin/PromotionsPage';
import LoyaltyPage from './pages/admin/LoyaltyPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import SettingsPage from './pages/admin/SettingsPage';
import FinancePage from './pages/admin/FinancePage';
import HRPage from './pages/admin/HRPage';
import OutletForm from './components/admin/outlets/OutletForm';
import OutletDetailPage from './pages/admin/OutletDetailPage';
import InventoryPage from './pages/admin/InventoryPage';

// Super Admin layout & pages
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminLoginPage from './pages/superadmin/SuperAdminLoginPage';
import SADashboardPage from './pages/superadmin/SADashboardPage';
import SATenantsPage from './pages/superadmin/SATenantsPage';
import SASubscriptionsPage from './pages/superadmin/SASubscriptionsPage';

// Customer App layout & pages
import AppLayout from './layouts/AppLayout';
import AppLoginPage from './pages/app/AppLoginPage';
import AppHomePage from './pages/app/AppHomePage';
import AppServicesPage from './pages/app/AppServicesPage';
import AppBookingPage from './pages/app/AppBookingPage';
import AppMyBookingsPage from './pages/app/AppMyBookingsPage';
import AppLoyaltyPage from './pages/app/AppLoyaltyPage';
import AppReferralPage from './pages/app/AppReferralPage';
import AppProfilePage from './pages/app/AppProfilePage';

// ── Phase 6: Role-Specific Layouts & Dashboards ────────────────────────
import ReceptionistLayout from './layouts/ReceptionistLayout';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';

import StylistLayout from './layouts/StylistLayout';
import StylistDashboard from './pages/stylist/StylistDashboard';

import AccountantLayout from './layouts/AccountantLayout';
import AccountantDashboard from './pages/accountant/AccountantDashboard';

import InventoryLayout from './layouts/InventoryLayout';
import InventoryDashboard from './pages/inventory/InventoryDashboard';

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
<<<<<<< HEAD
        <BusinessProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />

            {/* Admin Routes (Protected) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['admin', 'manager', 'receptionist', 'stylist', 'accountant', 'inventory_manager']}
                />
=======
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostDetailPage />} />
            <Route path="/contact" element={<ContactFullPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />

            {/* ═══════════════════════════════════════════════════════════
              ADMIN — Salon Owner Panel
              ═══════════════════════════════════════════════════════════ */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin']} />
>>>>>>> 2472437bba8d254ed167d6bf76c0bbac8fc03f3f
              }
            >
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/outlets" element={<OutletsPage />} />
                <Route path="/admin/outlets/new" element={<OutletForm />} />
                <Route path="/admin/outlets/edit/:id" element={<OutletForm />} />
                <Route path="/admin/outlets/:id" element={<OutletDetailPage />} />
                <Route path="/admin/staff" element={<StaffPage />} />
<<<<<<< HEAD

                {/* POS Routes */}
                <Route path="/admin/pos" element={<POSDashboardPage />} />
                <Route path="/admin/pos/invoices" element={<POSInvoicesPage />} />
                <Route path="/admin/pos/payments" element={<POSPaymentsPage />} />
                <Route path="/admin/pos/refunds" element={<POSRefundsPage />} />
                <Route path="/admin/pos/settings" element={<POSSettingsPage />} />
                <Route path="/admin/pos/dashboard" element={<POSDashboardPage />} />

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
                <Route path="/admin/services/settings" element={<ServicesPage tab="settings" />} />

                <Route path="/admin/products" element={<ProductsPage />} />

                {/* Inventory Routes */}
                <Route
                  element={<ProtectedRoute allowedRoles={['admin']} />}
                >
                  <Route path="/admin/inventory/products" element={<InventoryPage tab="products" />} />
                  <Route path="/admin/inventory/products/new" element={<InventoryPage tab="add-product" />} />
                </Route>

                <Route path="/admin/inventory" element={<InventoryPage tab="overview" />} />
                <Route path="/admin/inventory/overview" element={<InventoryPage tab="overview" />} />
                <Route path="/admin/inventory/stock-in" element={<InventoryPage tab="stock-in" />} />
                <Route path="/admin/inventory/adjustment" element={<InventoryPage tab="adjustment" />} />
                <Route path="/admin/inventory/alerts" element={<InventoryPage tab="alerts" />} />

=======
                <Route path="/admin/bookings" element={<BookingsPage />} />

                {/* CRM Routes */}
                <Route path="/admin/crm/customers" element={<CustomersPage tab="directory" />} />
                <Route path="/admin/crm/segments" element={<CustomersPage tab="segments" />} />
                <Route path="/admin/crm/feedback" element={<CustomersPage tab="feedback" />} />
                <Route path="/admin/crm/reengage" element={<CustomersPage tab="reengage" />} />
                <Route path="/admin/crm" element={<CustomersPage tab="directory" />} />
                <Route path="/admin/clients" element={<ClientsPage />} />
                <Route path="/admin/products" element={<ProductsPage />} />

                {/* Inventory Routes */}
                <Route path="/admin/inventory" element={<InventoryPage tab="overview" />} />
                <Route path="/admin/inventory/overview" element={<InventoryPage tab="overview" />} />
                <Route path="/admin/inventory/stock-in" element={<InventoryPage tab="stock-in" />} />
                <Route path="/admin/inventory/adjustment" element={<InventoryPage tab="adjustment" />} />
                <Route path="/admin/inventory/alerts" element={<InventoryPage tab="alerts" />} />

>>>>>>> 2472437bba8d254ed167d6bf76c0bbac8fc03f3f
                <Route path="/admin/finance" element={<FinancePage tab="dashboard" />} />
                <Route path="/admin/finance/dashboard" element={<FinancePage tab="dashboard" />} />
                <Route path="/admin/finance/suppliers" element={<FinancePage tab="suppliers" />} />
                <Route path="/admin/finance/invoices" element={<FinancePage tab="invoices" />} />
                <Route path="/admin/finance/expenses" element={<FinancePage tab="expenses" />} />
                <Route path="/admin/finance/reconciliation" element={<FinancePage tab="reconciliation" />} />
                <Route path="/admin/finance/tax" element={<FinancePage tab="tax" />} />
                <Route path="/admin/finance/eod" element={<FinancePage tab="eod" />} />
<<<<<<< HEAD
                <Route path="/admin/hr" element={<HRPage tab="staff" />} />
                <Route path="/admin/hr/staff" element={<HRPage tab="staff" />} />
                <Route path="/admin/hr/attendance" element={<HRPage tab="attendance" />} />
                <Route path="/admin/hr/shifts" element={<HRPage tab="shifts" />} />
                <Route path="/admin/hr/payroll" element={<HRPage tab="payroll" />} />
                <Route path="/admin/hr/performance" element={<HRPage tab="performance" />} />
=======
                <Route path="/admin/hr" element={<HRPage />} />
>>>>>>> 2472437bba8d254ed167d6bf76c0bbac8fc03f3f
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

<<<<<<< HEAD
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-bold text-text mb-2">403</h1>
                <p className="text-text-secondary mb-6">You don't have permission to access this page.</p>
                <button onClick={() => window.location.href = '/admin/login'} className="btn-primary">Go to Login</button>
              </div>
            } />

            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-bold text-text mb-2">404</h1>
                <p className="text-text-secondary mb-6">The page you're looking for doesn't exist.</p>
                <button onClick={() => window.location.href = '/admin'} className="btn-primary">Go to Dashboard</button>
              </div>
            } />

            {/* Super Admin Routes (Protected) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['superadmin']} />
              }
            >
              <Route element={<SuperAdminLayout />}>
                <Route path="/superadmin" element={<SADashboardPage />} />
                <Route path="/superadmin/tenants" element={<SATenantsPage />} />
                <Route path="/superadmin/subscriptions" element={<SASubscriptionsPage />} />
              </Route>
            </Route>
          </Routes>
        </BusinessProvider>
=======
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
                <Route path="/receptionist/appointments" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/queue" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/checkin" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/invoices" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/payments" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/settings" element={<ReceptionistDashboard />} />
              </Route>
            </Route>

            {/* ═══════════════════════════════════════════════════════════
              STYLIST — Personal Workspace
              ═══════════════════════════════════════════════════════════ */}
            <Route element={<ProtectedRoute allowedRoles={['stylist']} />}>
              <Route element={<StylistLayout />}>
                <Route path="/stylist" element={<StylistDashboard />} />
                <Route path="/stylist/clients" element={<StylistDashboard />} />
                <Route path="/stylist/commissions" element={<StylistDashboard />} />
                <Route path="/stylist/gallery" element={<StylistDashboard />} />
                <Route path="/stylist/timeoff" element={<StylistDashboard />} />
                <Route path="/stylist/settings" element={<StylistDashboard />} />
              </Route>
            </Route>

            {/* ═══════════════════════════════════════════════════════════
              ACCOUNTANT — Finance Panel
              ═══════════════════════════════════════════════════════════ */}
            <Route element={<ProtectedRoute allowedRoles={['accountant']} />}>
              <Route element={<AccountantLayout />}>
                <Route path="/accountant" element={<AccountantDashboard />} />
                <Route path="/accountant/revenue" element={<AccountantDashboard />} />
                <Route path="/accountant/expenses" element={<AccountantDashboard />} />
                <Route path="/accountant/invoices" element={<AccountantDashboard />} />
                <Route path="/accountant/payroll" element={<AccountantDashboard />} />
                <Route path="/accountant/tax" element={<AccountantDashboard />} />
                <Route path="/accountant/reconciliation" element={<AccountantDashboard />} />
                <Route path="/accountant/settings" element={<AccountantDashboard />} />
              </Route>
            </Route>

            {/* ═══════════════════════════════════════════════════════════
              INVENTORY MANAGER — Stock Panel
              ═══════════════════════════════════════════════════════════ */}
            <Route element={<ProtectedRoute allowedRoles={['inventory_manager']} />}>
              <Route element={<InventoryLayout />}>
                <Route path="/inventory" element={<InventoryDashboard />} />
                <Route path="/inventory/stock" element={<InventoryDashboard />} />
                <Route path="/inventory/purchase" element={<InventoryDashboard />} />
                <Route path="/inventory/transfer" element={<InventoryDashboard />} />
                <Route path="/inventory/alerts" element={<InventoryDashboard />} />
                <Route path="/inventory/reports" element={<InventoryDashboard />} />
                <Route path="/inventory/settings" element={<InventoryDashboard />} />
              </Route>
            </Route>

            {/* ═══════════════════════════════════════════════════════════
              SUPER ADMIN — SaaS Owner
              ═══════════════════════════════════════════════════════════ */}
            <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
              <Route element={<SuperAdminLayout />}>
                <Route path="/superadmin" element={<SADashboardPage />} />
                <Route path="/superadmin/tenants" element={<SATenantsPage />} />
                <Route path="/superadmin/subscriptions" element={<SASubscriptionsPage />} />
              </Route>
            </Route>

            {/* ═══════════════════════════════════════════════════════════
              POS — Point of Sale (shared by admin, manager, receptionist)
              ═══════════════════════════════════════════════════════════ */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist']} />
              }
            >
              <Route element={<POSLayout />}>
                <Route path="/pos" element={<POSDashboardPage />} />
                <Route path="/pos/billing" element={<POSBillingPage />} />
                <Route path="/pos/invoices" element={<POSInvoicesPage />} />
                <Route path="/pos/payments" element={<POSPaymentsPage />} />
                <Route path="/pos/refunds" element={<POSRefundsPage />} />
                <Route path="/pos/settings" element={<POSSettingsPage />} />
              </Route>
            </Route>

            {/* ═══════════════════════════════════════════════════════════
              CUSTOMER APP — Mobile-First Experience
              ═══════════════════════════════════════════════════════════ */}
            <Route element={
              <CustomerAuthProvider>
                <Outlet />
              </CustomerAuthProvider>
            }>
              <Route path="/app/login" element={<AppLoginPage />} />
              <Route element={<AppLayout />}>
                <Route path="/app" element={<AppHomePage />} />
                <Route path="/app/services" element={<AppServicesPage />} />
                <Route path="/app/book" element={<AppBookingPage />} />
                <Route path="/app/bookings" element={<AppMyBookingsPage />} />
                <Route path="/app/loyalty" element={<AppLoyaltyPage />} />
                <Route path="/app/referrals" element={<AppReferralPage />} />
                <Route path="/app/profile" element={<AppProfilePage />} />
              </Route>
            </Route>

            {/* ═══════════════════════════════════════════════════════════
              ERROR PAGES
              ═══════════════════════════════════════════════════════════ */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-bold text-text mb-2">403</h1>
                <p className="text-text-secondary mb-6">You don't have permission to access this page.</p>
                <button onClick={() => window.location.href = '/login'} className="btn-primary">Go to Login</button>
              </div>
            } />

            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-bold text-text mb-2">404</h1>
                <p className="text-text-secondary mb-6">The page you're looking for doesn't exist.</p>
                <button onClick={() => window.location.href = '/login'} className="btn-primary">Go to Login</button>
              </div>
            } />
          </Routes>
        </ThemeProvider>
>>>>>>> 2472437bba8d254ed167d6bf76c0bbac8fc03f3f
      </AuthProvider>
    </Router>
  );
}

export default App;
