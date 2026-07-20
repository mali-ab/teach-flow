import { createBrowserRouter } from "react-router-dom";
import CreateMeeting from "../pages/CreateMeeting";
import Dashboard from "../pages/Dashboard";

import Home from "../pages/Home";
import JoinMeeting from "../pages/JoinMeeting";
import Login from "../pages/Login";
import MeetingRoom from "../pages/MeetingRoom";

import Register from "../pages/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/create-meeting",
    element: <CreateMeeting />,
  },
  {
    path: "/join-meeting",
    element: <JoinMeeting />,
  },
  {
    path: "/join/:id",
    element: <JoinMeeting />,
  },
  {
    path: "/meeting/:id",
    element: <MeetingRoom />,
  },
]);
