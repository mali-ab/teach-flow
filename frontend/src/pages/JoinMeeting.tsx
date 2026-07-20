import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import {
  VideoCameraIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

export default function JoinMeeting() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [meetingId, setMeetingId] = useState<string>(id || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanId = meetingId.trim();

    if (!cleanId) {
      setError("Please enter a valid Meeting ID or Room Name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/meetings/${cleanId}/join`);

      if (response.data?.room_name || response.data?.id) {
        navigate(`/meeting/${encodeURIComponent(response.data.room_name || response.data.id)}`);
      } else {
        navigate(`/meeting/${encodeURIComponent(cleanId)}`);
      }
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.message ||
        "Unable to reach the meeting service. Joining locally with the room name instead.";
      setError(serverMessage);
      navigate(`/meeting/${encodeURIComponent(cleanId)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <DashboardNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 transition-all">
          {/* Header Icon & Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-blue-100/50">
              <VideoCameraIcon className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Join a Meeting
            </h1>

            <p className="text-slate-500 mt-2 text-sm max-w-sm">
              Enter your meeting ID or room code below to jump right into your
              session.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleJoin} className="space-y-6">
            {/* Input Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Meeting ID or Code
              </label>

              <div
                className={`flex items-center gap-3 rounded-2xl border bg-slate-50/50 px-4 py-3.5 transition-all ${
                  error
                    ? "border-red-300 bg-red-50/20 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
                }`}
              >
                <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />

                <input
                  type="text"
                  value={meetingId}
                  onChange={(e) => {
                    setMeetingId(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={loading}
                  placeholder="e.g. math-class-101 or 839-204-102"
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium text-sm disabled:opacity-50"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-xs font-medium animate-fadeIn">
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !meetingId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all text-white py-3.5 px-6 rounded-2xl font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                <>
                  <span>Join Meeting</span>
                  <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Need to create a new meeting instead?{" "}
              <a
                href="/create-meeting"
                className="text-blue-600 font-semibold hover:underline"
              >
                Create session
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
