import { useEffect, useRef } from "react";
import { UserIcon, MicrophoneIcon } from "@heroicons/react/24/solid";

interface Participant {
  id: number | string;
  name: string;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isVideoOff: boolean;
  isAudioMuted: boolean;
  isScreenSharing: boolean;
  videoContainer?: HTMLDivElement | null;
  screenContainer?: HTMLDivElement | null;
}

interface VideoGridProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  activeScreenShareParticipantId?: string | null;
  participants?: Participant[];
}

function VideoTile({
  participant,
  hideVideo,
  muted,
  container,
  isScreenFeed,
}: {
  participant: Participant;
  hideVideo: boolean;
  muted: boolean;
  container: HTMLDivElement | null | undefined;
  isScreenFeed?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Clear mount point safely
    mount.innerHTML = "";

    if (container && !hideVideo) {
      mount.appendChild(container);
    }

    return () => {
      if (mount) mount.innerHTML = "";
    };
  }, [container, hideVideo]);

  if (hideVideo || !container) {
    return (
      <div className="relative flex flex-col items-center justify-center space-y-2 p-4 w-full h-full bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
          <UserIcon className="w-6 h-6 md:w-8 h-8" />
        </div>
        <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
          {participant.name}
        </span>
        {muted && (
          <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md p-1.5 rounded-md border border-slate-800/80 z-10">
            <MicrophoneIcon className="w-3.5 h-3.5 text-rose-500" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden">
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full [&>video]:object-contain [&>video]:w-full [&>video]:h-full"
      />

      {/* Participant Badge overlay */}
      <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800/80 flex items-center space-x-2 text-xs z-10">
        <span className="font-medium text-slate-200 truncate max-w-[100px]">
          {participant.name}
        </span>
      </div>

      {/* Top right mic icon overlay */}
      {muted && (
        <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md p-1.5 rounded-md border border-slate-800/80 z-10">
          <MicrophoneIcon className="w-3.5 h-3.5 text-rose-500" />
        </div>
      )}

      {isScreenFeed && (
        <div className="absolute left-3 top-3 rounded-md bg-blue-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white z-10 shadow-sm border border-blue-500/50">
          Screen Share
        </div>
      )}
    </div>
  );
}

export default function VideoGrid({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  participants = [],
}: VideoGridProps) {
  // Find if anyone (including self) is actively presenting a screen
  const screenPresenter = participants.find((p) => p.isScreenSharing);

  // Dynamic standard grid calculator for when screen share is off
  const getGridClass = (count: number) => {
    if (count <= 1) return "grid-cols-1 grid-rows-1";
    if (count === 2)
      return "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6)
      return "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-3 md:grid-cols-4 auto-rows-fr";
  };

  // Border formatting utility when a user speaks
  const getBorderClass = (isSpeaking?: boolean) => {
    return isSpeaking
      ? "border-emerald-500 ring-2 ring-emerald-500/20"
      : "border-slate-800/80 hover:border-slate-700/60";
  };

  // RENDER INTERFACE 1: Screen Share Presentation Mode Active
  if (screenPresenter) {
    return (
      <div className="w-full h-full flex flex-col lg:flex-row bg-[#020617] overflow-hidden p-3 gap-3">
        {/* Main Spotlight View Container (Screen Feed Area) */}
        <div className="flex-1 h-2/3 lg:h-full relative rounded-2xl border border-slate-800/90 bg-slate-950 flex items-center justify-center shadow-2xl">
          <VideoTile
            participant={screenPresenter}
            hideVideo={false}
            muted={false}
            container={screenPresenter.screenContainer}
            isScreenFeed={true}
          />
        </div>

        {/* Horizontal/Vertical Sidebar Strip for Webcam Feeds */}
        <div className="w-full lg:w-72 h-1/3 lg:h-full flex lg:flex-col overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto gap-3 pb-2 lg:pb-0 scrollbar-thin scrollbar-thumb-slate-800">
          {participants.map((participant) => {
            const isSelfUser = participant.isSelf;
            const hideVideo = isSelfUser ? isVideoOff : participant.isVideoOff;
            const muted = isSelfUser ? isAudioMuted : participant.isAudioMuted;

            return (
              <div
                key={`camera-${participant.id}`}
                className={`relative flex-shrink-0 w-44 sm:w-52 lg:w-full h-full lg:h-40 rounded-2xl border transition-all duration-200 flex items-center justify-center shadow-md bg-slate-900/40 ${getBorderClass(
                  participant.isSpeaking,
                )}`}
              >
                <VideoTile
                  participant={participant}
                  hideVideo={hideVideo}
                  muted={muted}
                  container={participant.videoContainer}
                  isScreenFeed={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // RENDER INTERFACE 2: Standard Meeting Room Grid Layout
  return (
    <div className="w-full h-full p-4 flex flex-col justify-center items-center overflow-hidden bg-[#020617]">
      <div
        className={`w-full h-full grid gap-3 max-h-full max-w-7xl transition-all duration-300 ease-in-out ${getGridClass(
          participants.length,
        )}`}
      >
        {participants.map((participant) => {
          const isSelfUser = participant.isSelf;
          const hideVideo = isSelfUser ? isVideoOff : participant.isVideoOff;
          const muted = isSelfUser ? isAudioMuted : participant.isAudioMuted;

          return (
            <div
              key={`grid-${participant.id}`}
              className={`relative rounded-2xl overflow-hidden bg-slate-900/60 border transition-all duration-200 flex items-center justify-center min-h-[140px] shadow-lg ${getBorderClass(
                participant.isSpeaking,
              )}`}
            >
              <VideoTile
                participant={participant}
                hideVideo={hideVideo}
                muted={muted}
                container={participant.videoContainer}
                isScreenFeed={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
