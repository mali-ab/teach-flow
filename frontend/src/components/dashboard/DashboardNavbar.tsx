import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BellIcon,
  VideoCameraIcon,
  ChevronDownIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardNavbarProps {
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
}

export default function DashboardNavbar({
  userName = "Meret Meredow",
  userAvatar,
  notificationCount = 3,
}: DashboardNavbarProps) {
  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Meetings", href: "/meetings" },
    { name: "Schedule", href: "/schedule" },
  ];
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 transition-all">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Left Section: Logo & Primary Nav */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <VideoCameraIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-blue-600 bg-clip-text text-transparent tracking-tight">
              TeachFlow
            </span>
          </Link>

          {/* Navigation Links */}
          {/* <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50/80 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav> */}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Action: New Call */}
          {/* <Link
            to="/create-meeting"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>New Instant Call</span>
          </Link> */}

          {/* Divider */}
          {/* <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" /> */}

          {/* Notifications Button */}
          {/* <button
            type="button"
            aria-label="View notifications"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <BellIcon className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            )}
          </button> */}

          {/* User Profile Dropdown Toggle */}

          <div className="hidden lg:flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 pl-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                {userName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
              title="Logout"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
