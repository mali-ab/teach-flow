import { Link, NavLink } from "react-router-dom";
import {
  BellIcon,
  VideoCameraIcon,
  ChevronDownIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

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
          <button
            type="button"
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
          >
            <div className="relative">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-inner">
                  {userName.charAt(0)}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {userName}
              </span>
              {/* <span className="text-[10px] font-medium text-slate-400 leading-none">
                Instructor
              </span> */}
            </div>

            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
