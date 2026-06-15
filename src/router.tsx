import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

// Page imports
import Login from "./pages/login";
import Register from "./pages/register";
import Verify from "./pages/verify";
import Dashboard from "./pages";
import Vote from "./pages/vote";
import Results from "./pages/results";
import Guidelines from "./pages/guidelines";
import Settings from "./pages/settings";
import ProgramDashboard from "./pages/programs/[id]";
import JoinProgram from "./pages/programs/[id]/join";
import RequestJoinProgram from "./pages/programs/[id]/request-join";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";

// Admin page imports
import AdminLogin from "./pages/admin/login";
import AdminPrograms from "./pages/admin/programs";
import AdminCandidates from "./pages/admin/candidates";
import AdminCreateProgram from "./pages/admin/programs/create";
import AdminViewProgram from "./pages/admin/programs/[id]/view";

// Guards & Layout
import Layout from "./components/user/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin";
import AdminSettings from "./pages/admin/settings";
import AdminGuidelines from "./pages/admin/guidelines";
import AdminVote from "./pages/admin/vote";

// ─────────────────────────────────────────────
// 1. Root & Index Routes
// ─────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token) {
      throw redirect({ to: "/login" });
    }
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === "admin") {
          throw redirect({ to: "/admin/dashboard" });
        }
      } catch (e) {}
    }
    throw redirect({ to: "/dashboard" });
  },
});

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

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPassword,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: ResetPassword,
});

// ─────────────────────────────────────────────
// 3. Authenticated User Routes
//    One ProtectedRoute guard covers all children
// ─────────────────────────────────────────────
const userLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "user",
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => userLayout,
  path: "/dashboard",
  component: Dashboard,
});

const voteRoute = createRoute({
  getParentRoute: () => userLayout,
  path: "/vote",
  component: Vote,
});

const resultsRoute = createRoute({
  getParentRoute: () => userLayout,
  path: "/results",
  component: Results,
});

const guidelinesRoute = createRoute({
  getParentRoute: () => userLayout,
  path: "/guidelines",
  component: Guidelines,
});

const settingsRoute = createRoute({
  getParentRoute: () => userLayout,
  path: "/settings",
  component: Settings,
});

const programDashboardRoute = createRoute({
  getParentRoute: () => userLayout,
  path: "/programs/$programId",
  component: ProgramDashboard,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

// ─────────────────────────────────────────────
// 4b. Admin-only Routes  (/admin/*)
//     One ProtectedRoute + requireAdmin covers all children.
//     Nested routes are expressed as parent → children to
//     avoid TanStack Router prefix-match conflicts.
// ─────────────────────────────────────────────
const adminLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin",
  component: () => (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/dashboard",
  component: AdminDashboard,
});

const adminProgramsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/programs",
  component: AdminPrograms,
});

const adminCreateProgramRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/programs/create",
  component: AdminCreateProgram,
});

const adminViewProgramRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/programs/$programId/view",
  component: AdminViewProgram,
});

const adminVoteRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/vote",
  component: AdminVote,
});

const adminGuidelinesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/guidelines",
  component: AdminGuidelines,
});

const adminCandidatesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/candidates",
  component: AdminCandidates,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/settings",
  component: AdminSettings,
});

// ─────────────────────────────────────────────
// 5. Route Tree
// ─────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  // Index redirect route
  indexRoute,

  // Public — no auth
  loginRoute,
  registerRoute,
  verifyRoute,
  requestJoinProgramRoute,
  joinProgramRoute,
  adminLoginRoute,
  forgotPasswordRoute,
  resetPasswordRoute,

  // Authenticated users
  userLayout.addChildren([
    dashboardRoute,
    voteRoute,
    resultsRoute,
    guidelinesRoute,
    settingsRoute,
    programDashboardRoute,
  ]),

  // Admin only (/admin/*)
  adminLayout.addChildren([
    adminDashboardRoute,
    adminCreateProgramRoute,
    adminViewProgramRoute,
    adminProgramsRoute,
    adminGuidelinesRoute,
    adminVoteRoute,
    adminCandidatesRoute,
    adminSettingsRoute,
  ]),
]);

// ─────────────────────────────────────────────
// 6. Router
// ─────────────────────────────────────────────
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
