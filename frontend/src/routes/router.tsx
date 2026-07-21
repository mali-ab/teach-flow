import { createBrowserRouter, useNavigate } from "react-router-dom";
import CreateMeeting from "../pages/CreateMeeting";
import Dashboard from "../pages/Dashboard";
import { Navigate } from "react-router-dom";

import Home from "../pages/Home";
import JoinMeeting from "../pages/JoinMeeting";
import Login from "../pages/Login";
import MeetingRoom from "../pages/MeetingRoom";

import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import { JitsiRoomProvider } from "../contexts/JitsiRoomContext";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-meeting",
    element: (
      <ProtectedRoute>
        <CreateMeeting />
      </ProtectedRoute>
    ),
  },
  {
    path: "/join-meeting",
    element: (
      <ProtectedRoute>
        <JoinMeeting />
      </ProtectedRoute>
    ),
  },
  {
    path: "/meeting/:id",
    element: (
      <ProtectedRoute>
        <JitsiRoomProvider>
          <MeetingRoom />
        </JitsiRoomProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
