import { ShieldCheckIcon, SignalIcon } from "@heroicons/react/24/outline";

interface MeetingHeaderProps {
  roomName: string;
  duration: string;
  participantCount: number;
}

export default function MeetingHeader({
  roomName,
  duration,
  participantCount,
}: MeetingHeaderProps) {
  return (
    <header className="h-16 px-6 border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-lg flex items-center justify-between z-10">
      {/* Room Details */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live</span>
        </div>
        <h1 className="text-sm md:text-base font-semibold text-slate-200">
          {roomName}
        </h1>
      </div>

      {/* Connection & Time Metrics */}
      <div className="flex items-center space-x-6 text-xs text-slate-400">
        <div className="hidden sm:flex items-center space-x-2">
          <SignalIcon className="w-4 h-4 text-emerald-400" />
          <span>HD 1080p</span>
        </div>
        <div className="flex items-center space-x-1 font-mono bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
          <span>{duration}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-400">
          <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
          <span className="hidden md:inline">End-to-End Encrypted</span>
        </div>
      </div>
    </header>
  );
}
