import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

// Page imports
import LandingPage from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Verify from "./pages/verify";
import Dashboard from "./pages/dashboard";
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
import AdminRegister from "./pages/admin/register";
import AdminVerify from "./pages/admin/verify";
import AdminCreateWorkspace from "./pages/admin/create-workspace";
import AdminForgotPassword from "./pages/admin/forgot-password";
import AdminResetPassword from "./pages/admin/reset-password";
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
    // If already logged in, send them to the right dashboard
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      let user: any = null;
      try {
        user = JSON.parse(userJson);
      } catch {
        // Malformed JSON — ignore and show landing page
      }
      if (user?.role === "admin") {
        throw redirect({ to: "/admin/dashboard" });
      } else if (user) {
        throw redirect({ to: "/dashboard" });
      }
    }
    // Unauthenticated visitors see the landing page
  },
  component: LandingPage,
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
  // validateSearch: (search: Record<string, unknown>) => ({
  //   email: typeof search.email === "string" ? search.email : undefined,
  //   workspace_name: typeof search.workspace_name === "string" ? search.workspace_name : undefined,
  //   program_name: typeof search.program_name === "string" ? search.program_name : undefined,
  //   workspace_id: typeof search.workspace_id === "string" ? search.workspace_id : undefined,
  //   program_id: typeof search.program_id === "string" ? search.program_id : undefined,
  // }),
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify",
  component: Verify,
  // validateSearch: (search: Record<string, unknown>) => ({
  //   email: typeof search.email === "string" ? search.email : undefined,
  //   workspace_name: typeof search.workspace_name === "string" ? search.workspace_name : undefined,
  //   program_name: typeof search.program_name === "string" ? search.program_name : undefined,
  //   workspace_id: typeof search.workspace_id === "string" ? search.workspace_id : undefined,
  //   program_id: typeof search.program_id === "string" ? search.program_id : undefined,
  // }),
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

// ─────────────────────────────────────────────
// 4a. Admin Public/Onboarding Routes  (no sidebar)
//     These are standalone pages — no AdminLayout wrapper.
// ─────────────────────────────────────────────
const adminRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/register",
  component: AdminRegister,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
  validateSearch: (search: Record<string, unknown>): { email?: string } =>
    typeof search.email === "string" ? { email: search.email } : {},
});

const adminVerifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/verify",
  component: AdminVerify,
  validateSearch: (search: Record<string, unknown>): { email?: string } =>
    typeof search.email === "string" ? { email: search.email } : {},
});

const adminCreateWorkspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/create-workspace",
  component: AdminCreateWorkspace,
  beforeLoad: () => {
    if (!localStorage.getItem("token")) {
      throw redirect({ to: "/admin/login" });
    }
  },
});

const adminForgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/forgot-password",
  component: AdminForgotPassword,
});

const adminResetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/reset-password",
  component: AdminResetPassword,
  validateSearch: (search: Record<string, unknown>): { email?: string } =>
    typeof search.email === "string" ? { email: search.email } : {},
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
  // Landing page (public, redirects logged-in users)
  indexRoute,

  // Voter public routes
  loginRoute,
  registerRoute,
  verifyRoute,
  requestJoinProgramRoute,
  joinProgramRoute,
  forgotPasswordRoute,
  resetPasswordRoute,

  // Admin public / onboarding routes (no sidebar)
  adminLoginRoute,
  adminRegisterRoute,
  adminVerifyRoute,
  adminCreateWorkspaceRoute,
  adminForgotPasswordRoute,
  adminResetPasswordRoute,

  // Authenticated user routes
  userLayout.addChildren([
    dashboardRoute,
    voteRoute,
    resultsRoute,
    guidelinesRoute,
    settingsRoute,
    programDashboardRoute,
  ]),

  // Admin only (/admin/*) — protected with sidebar
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
