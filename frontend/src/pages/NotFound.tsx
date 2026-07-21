import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-blue-600/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-md w-full text-center bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl transition-all duration-300 hover:border-slate-700/60">
        
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center rounded-2xl mb-6 shadow-inner animate-pulse">
          <ExclamationTriangleIcon className="w-8 h-8 text-amber-500" />
        </div>

        {/* Status Codes & Error Statements */}
        <h1 className="text-7xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-200 tracking-wide mb-3">
          Meeting or Page Not Found
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          The link you followed may be broken, expired, or the room session might have been terminated by the host. Double-check your room identifier URL and try again.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition duration-200 shadow-lg shadow-blue-900/20 active:scale-95 cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}