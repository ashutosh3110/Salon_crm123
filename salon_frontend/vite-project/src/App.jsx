import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';

// Module Pages
import DashboardPage from './modules/dashboard/pages/DashboardPage';
import ClientListPage from './modules/clients/pages/ClientListPage';
import BookingListPage from './modules/bookings/pages/BookingListPage';
import POSPage from './modules/pos/pages/POSPage';
import ServiceListPage from './modules/services/pages/ServiceListPage';
import ProductListPage from './modules/products/pages/ProductListPage';
import StockOverviewPage from './modules/inventory/pages/StockOverviewPage';
import FinanceOverviewPage from './modules/finance/pages/FinanceOverviewPage';
import EmployeeListPage from './modules/hr/pages/EmployeeListPage';
import LoyaltyProgramPage from './modules/loyalty/pages/LoyaltyProgramPage';
import PromotionListPage from './modules/promotions/pages/PromotionListPage';
import MembershipListPage from './modules/membership/pages/MembershipListPage';
import CampaignListPage from './modules/marketing/pages/CampaignListPage';
import FeedbackListPage from './modules/feedback/pages/FeedbackListPage';
import RevenueReportPage from './modules/analytics/pages/RevenueReportPage';
import GeneralSettingsPage from './modules/settings/pages/GeneralSettingsPage';
import SupplierListPage from './modules/suppliers/pages/SupplierListPage';
import PlanListPage from './modules/subscription/pages/PlanListPage';
import OutletListPage from './modules/outlets/pages/OutletListPage';
import UserListPage from './modules/users/pages/UserListPage';

// Landing Page
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />

          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect inside app */}
              <Route index element={<Navigate to="/app/dashboard" replace />} />

              {/* Dashboard */}
              <Route path="dashboard" element={<DashboardPage />} />

              {/* ... other routes remain the same ... */}
              <Route path="clients" element={<ClientListPage />} />
              <Route path="bookings" element={<BookingListPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="services" element={<ServiceListPage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="inventory" element={<StockOverviewPage />} />
              <Route path="finance" element={<FinanceOverviewPage />} />
              <Route path="hr/employees" element={<EmployeeListPage />} />
              <Route path="suppliers" element={<SupplierListPage />} />
              <Route path="loyalty" element={<LoyaltyProgramPage />} />
              <Route path="promotions" element={<PromotionListPage />} />
              <Route path="memberships" element={<MembershipListPage />} />
              <Route path="marketing/campaigns" element={<CampaignListPage />} />
              <Route path="feedback" element={<FeedbackListPage />} />
              <Route path="analytics/revenue" element={<RevenueReportPage />} />
              <Route path="subscriptions" element={<PlanListPage />} />
              <Route path="outlets" element={<OutletListPage />} />
              <Route path="users" element={<UserListPage />} />
              <Route path="settings" element={<GeneralSettingsPage />} />
              <Route path="settings/general" element={<GeneralSettingsPage />} />

              {/* Catch-all inside /app */}
              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Route>

            {/* Catch-all for top-level routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
