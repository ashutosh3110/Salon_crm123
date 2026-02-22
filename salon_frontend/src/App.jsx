import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Public pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

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
import POSDashboardPage from './pages/admin/pos/POSDashboardPage';
import POSInvoicesPage from './pages/admin/pos/POSInvoicesPage';
import POSPaymentsPage from './pages/admin/pos/POSPaymentsPage';
import POSRefundsPage from './pages/admin/pos/POSRefundsPage';
import POSSettingsPage from './pages/admin/pos/POSSettingsPage';
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

function App() {
  return (
    <Router>
      <AuthProvider>
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
            }
          >
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/outlets" element={<OutletsPage />} />
              <Route path="/admin/outlets/new" element={<OutletForm />} />
              <Route path="/admin/outlets/edit/:id" element={<OutletForm />} />
              <Route path="/admin/outlets/:id" element={<OutletDetailPage />} />
              <Route path="/admin/staff" element={<StaffPage />} />

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
              <Route path="/admin/products" element={<ProductsPage />} />

              {/* Inventory Routes */}
              <Route path="/admin/inventory" element={<InventoryPage tab="overview" />} />
              <Route path="/admin/inventory/overview" element={<InventoryPage tab="overview" />} />
              <Route path="/admin/inventory/stock-in" element={<InventoryPage tab="stock-in" />} />
              <Route path="/admin/inventory/adjustment" element={<InventoryPage tab="adjustment" />} />
              <Route path="/admin/inventory/alerts" element={<InventoryPage tab="alerts" />} />

              <Route path="/admin/finance" element={<FinancePage tab="dashboard" />} />
              <Route path="/admin/finance/dashboard" element={<FinancePage tab="dashboard" />} />
              <Route path="/admin/finance/suppliers" element={<FinancePage tab="suppliers" />} />
              <Route path="/admin/finance/invoices" element={<FinancePage tab="invoices" />} />
              <Route path="/admin/finance/expenses" element={<FinancePage tab="expenses" />} />
              <Route path="/admin/finance/reconciliation" element={<FinancePage tab="reconciliation" />} />
              <Route path="/admin/finance/tax" element={<FinancePage tab="tax" />} />
              <Route path="/admin/finance/eod" element={<FinancePage tab="eod" />} />
              <Route path="/admin/hr" element={<HRPage />} />
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
      </AuthProvider>
    </Router>
  );
}

export default App;

