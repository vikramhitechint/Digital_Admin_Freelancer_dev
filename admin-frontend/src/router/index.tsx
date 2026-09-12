import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import AdminShell from '@/components/layout/AdminShell';

// Auth
import LoginPage from '@/features/auth/LoginPage';
import TwoFAPage from '@/features/auth/TwoFAPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';

// Dashboard
import DashboardPage from '@/features/dashboard/DashboardPage';

// Companies
import CompaniesPage from '@/features/companies/CompaniesPage';
import CompanyDetailPage from '@/features/companies/CompanyDetailPage';

// Freelancers
import FreelancersPage from '@/features/freelancers/FreelancersPage';
import FreelancerDetailPage from '@/features/freelancers/FreelancerDetailPage';

// Projects
import ProjectsPage from '@/features/projects/ProjectsPage';
import ProjectDetailPage from '@/features/projects/ProjectDetailPage';

// Payments
import PaymentsPage from '@/features/payments/PaymentsPage';

// Settings
import SettingsPage from '@/features/settings/SettingsPage';


// ── Protected Route ───────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, requires2FA } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (requires2FA) return <Navigate to="/admin/2fa" replace />;

  return <>{children}</>;
}

// ── Router ────────────────────────────────────
export default function AppRouter() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/admin/dashboard' : '/admin/login'} replace />}
        />

        {/* Auth */}
        <Route
          path="/admin/login"
          element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />}
        />
        <Route path="/admin/2fa" element={<TwoFAPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Protected Shell */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />

          <Route path="freelancers" element={<FreelancersPage />} />
          <Route path="freelancers/:id" element={<FreelancerDetailPage />} />

          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />

          <Route path="payments" element={<PaymentsPage />} />
          
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/admin/dashboard' : '/admin/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
