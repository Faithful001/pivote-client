import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

// Component imports
import Login from "./pages/login";
import Register from "./pages/register";
import Verify from "./pages/verify";
import Dashboard from "./pages";
import Vote from "./pages/vote";
import Results from "./pages/results";
import Guidelines from "./pages/guidelines";
import Settings from "./pages/settings";
import AdminPrograms from "./pages/admin/programs";
// import AdminCandidates from "./pages/admin/candidates";
import ProgramDashboard from "./pages/programs/[id]";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import JoinProgram from "./pages/programs/[id]/join";
import RequestJoinProgram from "./pages/programs/[id]/request-join";
import AdminCreateProgram from "./pages/admin/programs/create";
// import AdminEditProgram from "./pages/admin/programs/[id]/edit";
import AdminViewProgram from "./pages/admin/programs/[id]/view";

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
  path: "/login",
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify",
  component: Verify,
});

const requestJoinProgramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/programs/$programId/request-join",
  component: RequestJoinProgram,
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
    workspace_name: typeof search.workspace_name === "string" ? search.workspace_name : undefined,
    program_name: typeof search.program_name === "string" ? search.program_name : undefined,
    workspace_id: typeof search.workspace_id === "string" ? search.workspace_id : undefined,
  }),
});
const joinProgramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/programs/$programId/join",
  component: JoinProgram,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
    workspace_name: typeof search.workspace_name === "string" ? search.workspace_name : undefined,
    program_name: typeof search.program_name === "string" ? search.program_name : undefined,
    workspace_id: typeof search.workspace_id === "string" ? search.workspace_id : undefined,
  }),
});

// 3. Define Protected/Dashboard Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
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
  path: "/vote",
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
  path: "/results",
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
  path: "/guidelines",
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
  path: "/settings",
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
  path: "/admin/programs",
  component: () => (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <AdminPrograms />
      </Layout>
    </ProtectedRoute>
  ),
});

const adminCreateProgramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/programs/create",
  component: () => (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <AdminCreateProgram />
      </Layout>
    </ProtectedRoute>
  ),
});

const adminViewProgramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/programs/$programId/view",
  component: () => (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <AdminViewProgram />
      </Layout>
    </ProtectedRoute>
  ),
});

// const adminCandidatesRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/admin/candidates",
//   component: () => (
//     <ProtectedRoute requireAdmin={true}>
//       <Layout>
//         <AdminCandidates />
//       </Layout>
//     </ProtectedRoute>
//   ),
// });

const programDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/programs/$programId",
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
  requestJoinProgramRoute,
  joinProgramRoute,
  voteRoute,
  resultsRoute,
  guidelinesRoute,
  settingsRoute,
  adminProgramsRoute,
  adminCreateProgramRoute,
  adminViewProgramRoute,
  // adminCandidatesRoute,
  programDashboardRoute,
]);

// 5. Create Router
export const router = createRouter({ routeTree });

// Register types for TypeScript support
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
