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
import PromotionsPage from './pages/admin/PromotionsPage';
import LoyaltyPage from './pages/admin/LoyaltyPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import SettingsPage from './pages/admin/SettingsPage';

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
              <Route path="/admin/clients" element={<ClientsPage />} />
              <Route path="/admin/bookings" element={<BookingsPage />} />
              <Route path="/admin/services" element={<ServicesPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/outlets" element={<OutletsPage />} />
              <Route path="/admin/staff" element={<StaffPage />} />
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

