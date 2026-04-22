import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import Spinner from './components/ui/Spinner';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardRouter = lazy(() => import('./pages/DashboardRouter'));
const HeroPage = lazy(() => import('./pages/HeroPage'));

const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const VolunteerDashboard = lazy(() => import('./pages/volunteer/VolunteerDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg))] px-4 text-[rgb(var(--ink))]">
      <div className="card flex w-full max-w-sm items-center justify-center gap-3 p-6 text-sm font-bold">
        <Spinner />
        <span>Loading coordination console...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardRouter />} />

            <Route element={<ProtectedRoute roles={['Citizen']} />}>
              <Route path="/citizen" element={<CitizenDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['Volunteer']} />}>
              <Route path="/volunteer" element={<VolunteerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
