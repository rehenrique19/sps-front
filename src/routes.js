import { createBrowserRouter, Navigate } from "react-router-dom";

import SignIn from "./pages/SignIn";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import UserView from "./pages/UserView";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/users" replace />,
  },
  {
    path: "/signin",
    element: (
      <PublicRoute>
        <SignIn />
      </PublicRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users/new",
    element: (
      <ProtectedRoute>
        <UserForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users/:userId",
    element: (
      <ProtectedRoute>
        <UserView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users/:userId/edit",
    element: (
      <ProtectedRoute>
        <UserForm />
      </ProtectedRoute>
    ),
  },
]);

export default router;
