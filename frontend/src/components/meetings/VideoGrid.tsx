import { UserIcon, MicrophoneIcon } from "@heroicons/react/24/solid";
import { useJitsiRoom } from "../../contexts/JitsiRoomContext";

interface Participant {
  id: number | string;
  name: string;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isVideoOff?: boolean;
  isAudioMuted?: boolean;
  isScreenSharing?: boolean;
}

interface VideoGridProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  activeScreenShareParticipantId?: string | number | null;
  participants?: Participant[];
}

export default function VideoGrid({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  activeScreenShareParticipantId = null,
  participants = [],
}: VideoGridProps) {
  const { isReady, conferenceError } = useJitsiRoom();
  const totalCount = participants.length;

  // If Jitsi is not ready yet, show a loading state
  if (!isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#020617]">
        <div className="text-center">
          {conferenceError ? (
            <div className="text-sm text-rose-400">{conferenceError}</div>
          ) : (
            <>
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <div className="text-sm text-slate-400">Connecting to meeting…</div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Dynamically calculate grid columns based on total count (Zoom style)
  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 grid-rows-1 md:grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    if (count <= 12) return "grid-cols-3 md:grid-cols-4 grid-rows-4 md:grid-rows-3";
    return "grid-cols-4 md:grid-cols-5 auto-rows-fr";
  };

  return (
    <div className="w-full h-full p-4 flex flex-col justify-center items-center overflow-hidden bg-[#020617]">
      <div
        className={`w-full h-full grid gap-3 max-h-full max-w-7xl transition-all duration-300 ease-in-out ${getGridClass(totalCount)}`}
      >
        {participants.map((participant) => {
          const isSelfUser = participant.isSelf;
          const hideVideo = isSelfUser ? isVideoOff : participant.isVideoOff;
          const muted = isSelfUser ? isAudioMuted : participant.isAudioMuted;
          const isSharingThisParticipant = participant.id === activeScreenShareParticipantId;
          const initials = participant.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={participant.id}
              className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border transition-all duration-200 flex items-center justify-center min-h-35 shadow-lg ${
                participant.isSpeaking
                  ? "border-emerald-500 ring-2 ring-emerald-500/30"
                  : "border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Video is handled by Jitsi iframe; show placeholder tile */}
              {hideVideo ? (
                <div className="flex flex-col items-center justify-center space-y-2 p-4">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
                    <UserIcon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Camera Off</span>
                </div>
              ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center relative">
                  <div className="flex flex-col items-center justify-center space-y-3 text-center px-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-200 text-lg font-semibold shadow-inner">
                      {initials || "U"}
                    </div>
                    {isSharingThisParticipant && (
                      <span className="text-xs text-blue-400 font-semibold tracking-wide">Sharing screen</span>
                    )}
                  </div>

                  {(isScreenSharing || isSharingThisParticipant) && isSelfUser && (
                    <div className="absolute left-3 top-3 rounded-full bg-blue-600/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Sharing
                    </div>
                  )}
                </div>
              )}

              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center space-x-2 text-xs">
                <span className="font-medium text-slate-200">{participant.name}</span>
                {muted && <MicrophoneIcon className="w-3.5 h-3.5 text-rose-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

