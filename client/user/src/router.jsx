import { createBrowserRouter, Navigate } from "react-router-dom";
import Root from "./layouts/Root";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Turf from "./components/turf/Turf";
import TurfDetails from "./components/turf/TurfDetails";
import BecomeOwner from "./features/becomeOwner/BecomeOwner";
import ProtectedLayout from "./layouts/ProtectedLayout";
import Reservation from "./components/Reservation";
import TurfBookingHistory from "./components/turf/TurfBookingHistory";
import NotFound from "./components/common/NotFound";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import RoleRoute from "./components/common/RoleRoute";

const router = createBrowserRouter([
  // Legacy / Direct Admin Login Redirect to Unified Login
  {
    path: "/admin/login",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <RoleRoute requiredRole="admin">
        <AdminDashboardPage />
      </RoleRoute>
    ),
  },

  // Legacy / Direct Owner Login Redirect to Unified Login
  {
    path: "/owner/login",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/owner/dashboard",
    element: (
      <RoleRoute requiredRole="owner">
        <OwnerDashboardPage />
      </RoleRoute>
    ),
  },
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "turfs",
        element: <Turf />,
      },
      {
        path: "turf/:id",
        element: <TurfDetails />,
      },
    ],
  },
  {
    path: "/auth",
    element: <ProtectedLayout />,
    // errorElement: <div>Error</div>,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "turfs",
        element: <Turf />,
      },
      {
        path: "turf/:id",
        element: <TurfDetails />,
      },

      {
        path: "reserve/:id",
        element: <Reservation />,
      },
      {
        path: "become-owner",
        element: <BecomeOwner />,
      },
      {
        path: "booking-history",
        element: <TurfBookingHistory />,
      },
    ],
  },
]);

export default router;
