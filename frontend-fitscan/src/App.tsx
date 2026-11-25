import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { AttendanceKioskPage } from './features/attendance/pages/AttendanceKioskPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ClientsListPage } from './features/clients/pages/ClientsListPage';
import { MembershipsPage } from './features/memberships/pages/MembershipsPage';
import { PaymentsListPage } from './features/payments/pages/PaymentsListPage';
import { CashManagementPage } from './features/cash/pages/CashManagementPage';
import { ReportsPage } from './features/reports/pages/ReportsPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { UsersManagementPage } from './features/users/pages/UsersManagementPage';
import { useAuthStore } from './features/auth/state/useAuthStore';
import { ToastProvider } from './components/ui/ToastProvider';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PermissionRoute = ({ permission, children }: { permission: string; children: React.ReactNode }) => {
  const { hasPermission } = useAuthStore();
  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            <Route path="asistencias" element={
              <PermissionRoute permission="attendance.scan">
                <AttendanceKioskPage />
              </PermissionRoute>
            } />

            <Route path="clientes" element={
              <PermissionRoute permission="clients.view">
                <ClientsListPage />
              </PermissionRoute>
            } />

            <Route path="membresias" element={
              <PermissionRoute permission="memberships.view">
                <MembershipsPage />
              </PermissionRoute>
            } />

            <Route path="pagos" element={
              <PermissionRoute permission="payments.create">
                <PaymentsListPage />
              </PermissionRoute>
            } />

            <Route path="caja" element={
              <PermissionRoute permission="payments.create">
                <CashManagementPage />
              </PermissionRoute>
            } />

            <Route path="reportes" element={
              <PermissionRoute permission="reports.view">
                <ReportsPage />
              </PermissionRoute>
            } />

            <Route path="usuarios" element={
              <PermissionRoute permission="settings.view">
                <UsersManagementPage />
              </PermissionRoute>
            } />

            <Route path="configuracion" element={
              <PermissionRoute permission="settings.view">
                <SettingsPage />
              </PermissionRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}
