import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Sparkles,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardNavbarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export default function DashboardNavbar({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isPro = user?.subscription === "pro";

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6">
      <div className="h-full flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Mobile Sidebar Trigger (Visible on small screens) */}
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Quick Search */}
          <div className="relative w-full max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, classes..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/70 border border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* Pro Status Badge */}
          <Link
            to="/pricing"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
              isPro
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:opacity-95"
                : "bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPro ? "PRO" : "Upgrade"}</span>
          </Link>

          {/* Notifications Button */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* Divider */}
          {/* <div className="h-5 w-px bg-slate-200 hidden sm:block" /> */}

          {/* User Profile Menu Dropdown */}
          {/* <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white ring-2 ring-slate-100">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-medium text-slate-700 hidden md:inline-block max-w-[100px] truncate">
                {user?.name || "Student"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline-block" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-xl border border-slate-100 z-20 text-xs text-slate-600 space-y-0.5">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/student/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile Settings
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Billing & Subscription
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div> */}
        </div>
      </div>
    </header>
  );
}