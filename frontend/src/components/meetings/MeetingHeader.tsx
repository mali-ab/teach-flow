import { ShieldCheckIcon, SignalIcon } from "@heroicons/react/24/outline";

interface MeetingHeaderProps {
  roomName: string;
  duration: string;
  participantCount: number;
  role?: "Host" | "Teacher" | "Student" | "Guest";
  isSpeaking?: boolean;
}

export default function MeetingHeader({
  roomName,
  duration,
  participantCount,
  role = "Host",
  isSpeaking = false,
}: MeetingHeaderProps) {
  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-800/60 bg-[#020617]/90 backdrop-blur-lg flex items-center justify-between z-10">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>Live</span>
        </div>

        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-sm font-semibold text-slate-200 md:text-base">
            {roomName}
          </h1>
          <p className="text-[11px] text-slate-500">
            {participantCount} participant{participantCount === 1 ? "" : "s"} joined
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            isSpeaking
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-slate-700 bg-slate-900/70 text-slate-400"
          }`}
        >
          {isSpeaking ? "Speaking" : "Listening"}
        </div>

        <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400">
          {role}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-[11px] text-slate-400">
        <div className="hidden items-center gap-2 sm:flex">
          <SignalIcon className="h-4 w-4 text-emerald-400" />
          <span>HD 1080p</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-mono">
          <span>{duration}</span>
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <ShieldCheckIcon className="h-4 w-4 text-blue-400" />
          <span>Secure</span>
        </div>
      </div>
    </header>
  );
}
