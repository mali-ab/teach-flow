import React from "react";
import { NavLink } from "react-router-dom";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import StatCard from "../components/dashboard/StatCard";
import UpcomingMeeting from "../components/dashboard/UpcomingMeeting";
import QuickAction from "../components/dashboard/QuickAction";

import {
  VideoCameraIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  PlusIcon,
  LinkIcon,
  ClockIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";

// Interface for activity items
interface ActivityItem {
  id: number;
  title: string;
  time: string;
  type: "completed" | "scheduled" | "cancelled";
}

// Sample dynamic activity data
const recentActivities: ActivityItem[] = [
  {
    id: 1,
    title: "Physics Class ended",
    time: "Today at 10:45 AM",
    type: "completed",
  },
  {
    id: 2,
    title: "Mathematics Workshop scheduled",
    time: "Yesterday at 4:30 PM",
    type: "scheduled",
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-4 z-10 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, John 👋
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

          <div className="bg-white/15 backdrop-blur-md rounded-3xl p-6 hidden md:flex items-center justify-center border border-white/20 shadow-inner">
            <VideoCameraIcon className="w-20 h-20 text-white/90 drop-shadow" />
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Meeting View */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Upcoming Meeting
              </h2>

              <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>

            <UpcomingMeeting />
          </div>

          {/* Quick Actions Panel */}
          {/* <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quick Actions
            </h2>

            <div className="space-y-3">
              <QuickAction
                title="Create New Meeting"
                link="/create-meeting"
                icon={<PlusIcon className="w-6 h-6" />}
              />

              <QuickAction
                title="Join With Link"
                link="/join-meeting"
                icon={<VideoCameraIcon className="w-6 h-6" />}
              />
            </div>
          </div> */}
        </section>

        {/* Recent Activity Feed */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>

          <div className="mt-5 space-y-3">
            {recentActivities.map((activity: ActivityItem) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/60 transition duration-150"
              >
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <ClockIcon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm sm:text-base">
                    {activity.title}
                  </p>
                  <span className="text-xs sm:text-sm text-slate-500">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
