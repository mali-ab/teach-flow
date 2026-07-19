import {
  MicrophoneIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PhoneXMarkIcon,
} from "@heroicons/react/24/outline";

interface MeetingControlsProps {
  isAudioMuted: boolean;
  setIsAudioMuted: (val: boolean | ((prev: boolean) => boolean)) => void;
  isVideoOff: boolean;
  setIsVideoOff: (val: boolean | ((prev: boolean) => boolean)) => void;
  isScreenSharing: boolean;
  setIsScreenSharing: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeSidePanel: "chat" | "participants" | null;
  toggleSidePanel: (panel: "chat" | "participants") => void;
}

export default function MeetingControls({
  isAudioMuted,
  setIsAudioMuted,
  isVideoOff,
  setIsVideoOff,
  isScreenSharing,
  setIsScreenSharing,
  activeSidePanel,
  toggleSidePanel,
}: MeetingControlsProps) {
  return (
    <footer className="h-20 px-6 border-t border-slate-800/60 bg-[#020617]/90 backdrop-blur-lg flex items-center justify-between z-10">
      <div className="hidden md:flex items-center w-1/4">
        <span className="text-xs text-slate-500 font-mono">TeachFlow v1.0</span>
      </div>

      {/* Main Action Group */}
      <div className="flex items-center space-x-3 mx-auto">
        {/* Mic Toggle */}
        <button
          onClick={() => setIsAudioMuted((prev) => !prev)}
          className={`p-3.5 rounded-xl border transition-all duration-200 ${
            isAudioMuted
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
              : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
          }`}
        >
          <MicrophoneIcon className="w-5 h-5" />
        </button>

        {/* Video Toggle */}
        <button
          onClick={() => setIsVideoOff((prev) => !prev)}
          className={`p-3.5 rounded-xl border transition-all duration-200 ${
            isVideoOff
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
              : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
          }`}
        >
          <VideoCameraIcon className="w-5 h-5" />
        </button>

        {/* Screen Share */}
        <button
          onClick={() => setIsScreenSharing((prev) => !prev)}
          className={`p-3.5 rounded-xl border transition-all duration-200 ${
            isScreenSharing
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
          }`}
        >
          <ComputerDesktopIcon className="w-5 h-5" />
        </button>

        {/* Leave / End Meeting Button */}
        <button className="px-5 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center space-x-2 transition-all shadow-lg shadow-rose-950/40">
          <PhoneXMarkIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Utility Drawers Toggle */}
      <div className="flex items-center space-x-2 justify-end w-1/4">
        <button
          onClick={() => toggleSidePanel("participants")}
          className={`p-3 rounded-xl border transition ${
            activeSidePanel === "participants"
              ? "bg-blue-600/20 border-blue-500 text-blue-400"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserGroupIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleSidePanel("chat")}
          className={`p-3 rounded-xl border transition ${
            activeSidePanel === "chat"
              ? "bg-blue-600/20 border-blue-500 text-blue-400"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
}
