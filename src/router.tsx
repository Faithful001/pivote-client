import { 
  createRootRoute, 
  createRoute, 
  createRouter, 
  Outlet 
} from '@tanstack/react-router';
import { Toaster } from 'sonner';

// Component imports
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Guidelines from './pages/Guidelines';
import Settings from './pages/Settings';
import AdminPrograms from './pages/AdminPrograms';
import AdminCandidates from './pages/AdminCandidates';
import ProgramDashboard from './pages/ProgramDashboard';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// 1. Define Root Route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  ),
});

// 2. Define Public Routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify',
  component: Verify,
});

// 3. Define Protected/Dashboard Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  ),
});

const voteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vote',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Vote />
      </Layout>
    </ProtectedRoute>
  ),
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/results',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Results />
      </Layout>
    </ProtectedRoute>
  ),
});

const guidelinesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guidelines',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Guidelines />
      </Layout>
    </ProtectedRoute>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Settings />
      </Layout>
    </ProtectedRoute>
  ),
});

// Admin-only Routes
const adminProgramsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/programs',
  component: () => (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <AdminPrograms />
      </Layout>
    </ProtectedRoute>
  ),
});

const adminCandidatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/candidates',
  component: () => (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <AdminCandidates />
      </Layout>
    </ProtectedRoute>
  ),
});

const programDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/programs/$programId',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <ProgramDashboard />
      </Layout>
    </ProtectedRoute>
  ),
});

// 4. Construct Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  verifyRoute,
  voteRoute,
  resultsRoute,
  guidelinesRoute,
  settingsRoute,
  adminProgramsRoute,
  adminCandidatesRoute,
  programDashboardRoute,
]);

// 5. Create Router
export const router = createRouter({ routeTree });

// Register types for TypeScript support
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
