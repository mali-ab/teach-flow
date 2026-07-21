import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../lib/axios";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import StatCard from "../components/dashboard/StatCard";
import UpcomingMeeting from "../components/dashboard/UpcomingMeeting";
import QuickAction from "../components/dashboard/QuickAction";
import { useAuth } from "../contexts/AuthContext";

import {
  VideoCameraIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  PlusIcon,
  LinkIcon,
  ClockIcon,
  PlayCircleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

// Interface for activity items
interface ActivityItem {
  id: number;
  title: string;
  roomName: string;
  time: string;
  type: "completed" | "scheduled" | "cancelled";
}

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const displayName = user?.name ?? "";
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  const getActivityStyles = (type?: string) => {
    switch (type) {
      case "join":
        return {
          icon: VideoCameraIcon,
          bg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        };
      case "leave":
        return {
          icon: ArrowLeftOnRectangleIcon,
          bg: "bg-rose-50 text-rose-600 border border-rose-100",
        };
      default:
        return {
          icon: ClockIcon,
          bg: "bg-blue-50 text-blue-600 border border-blue-100",
        };
    }
  };

  const getRecentActivities = async () => {
    try {
      const response = await api.get(`/meetings/${user?.id}`);
      const data: any[] = response.data || [];
      const mapped: ActivityItem[] = data.map((item: any, index: number) => ({
        id: item.ID || index + 1,
        title: item.Title || item.RoomName || "Meeting",
        roomName: item.RoomName || "N/A",
        time: item.CreatedAt
          ? new Date(item.CreatedAt).toLocaleString()
          : "Recently",
        type: "completed",
      }));
      setRecentActivities(mapped);
    } catch {
      // fallback: keep empty array
    }
  };

  useEffect(() => {
    if (user?.id) {
      getRecentActivities();
    }
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <DashboardNavbar userName={displayName || "User"} />

      {/* Logout is handled here so we can use useAuth() */}
      {/* (DashboardNavbar remains reusable; button is in page layout) */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-4 z-10 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-blue-100 text-base sm:text-lg font-normal leading-relaxed">
              Start meetings, invite students, and manage your online classroom
              effortlessly.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <NavLink
                to="/create-meeting"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-blue-50 transition duration-200 active:scale-95"
              >
                <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                Create Meeting
              </NavLink>

              <NavLink
                to="/join-meeting"
                className="inline-flex items-center gap-2 border border-white/40 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition duration-200 active:scale-95"
              >
                <LinkIcon className="w-5 h-5 stroke-[2.5]" />
                Join Class
              </NavLink>
            </div>
          </div>

          <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain" />
        </section>

        {/* Recent Activity Feed */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>

          <div className="mt-5 space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {recentActivities.map((activity: ActivityItem) => {
              const styles = getActivityStyles(activity.type);
              const IconComponent = styles.icon;

              return (
                <div
                  key={activity.id}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200 mr-1"
                >
                  {/* Action Icon Wrapper */}
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105 ${styles.bg}`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 h-6" />
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                        {activity.title}
                      </p>
                      <span className="text-xs text-slate-400 font-medium shrink-0 sm:text-right">
                        {activity.time}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 truncate">
                      Room:{" "}
                      <span className="text-slate-600 font-semibold">
                        {activity.roomName}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
