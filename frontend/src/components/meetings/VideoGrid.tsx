import { useEffect, useRef, useState } from "react";
import { UserIcon, MicrophoneIcon } from "@heroicons/react/24/solid";

interface Participant {
  id: number | string;
  name: string;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isVideoOff?: boolean;
  isAudioMuted?: boolean;
}

interface VideoGridProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  activeScreenShareParticipantId?: string | number | null;
  screenShareStream?: MediaStream | null;
  // Make participants configurable via props (falls back to demo data)
  participants?: Participant[];
}

export default function VideoGrid({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  activeScreenShareParticipantId = null,
  screenShareStream = null,
  participants = [
    { id: 1, name: "You (Host)", isSelf: true },
    { id: 2, name: "Dr. Sarah Jenkins", isSpeaking: true },
    { id: 3, name: "Alex Rivera", isSpeaking: false },
    { id: 4, name: "Elena Rostova", isSpeaking: false },
  ],
}: VideoGridProps) {
  const totalCount = participants.length;
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const selfVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);

  const attachStreamToVideo = (stream: MediaStream | null) => {
    const videoElement = selfVideoRef.current;
    if (!videoElement) {
      return;
    }

    videoElement.srcObject = stream;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.autoplay = true;

    if (stream) {
      videoElement.onloadedmetadata = () => {
        videoElement.play().catch(() => undefined);
      };
    }
  };

  const requestCamera = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    const hasSecureContext = window.isSecureContext || isLocalhost;

    if (!hasSecureContext) {
      setStreamError("Camera access requires a secure connection. Open this app on localhost or HTTPS and try again.");
      return;
    }

    const mediaDevices = navigator.mediaDevices;
    const legacyGetUserMedia = (navigator as Navigator & {
      getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
    }).getUserMedia;

    if (!mediaDevices?.getUserMedia && typeof legacyGetUserMedia !== "function") {
      setStreamError("Camera access is unavailable in this browser. Please use a modern browser with camera support.");
      return;
    }

    setIsRequestingCamera(true);
    setStreamError(null);
    setLocalStream(null);

    try {
      const stream = await (mediaDevices?.getUserMedia?.({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }) ?? legacyGetUserMedia!({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }));

      if (!stream.getVideoTracks().length) {
        throw new DOMException("No video track was returned", "NotFoundError");
      }

      attachStreamToVideo(stream);
      setLocalStream(stream);
      setStreamError(null);
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          setStreamError("Camera access was blocked. Please allow camera access for this site and refresh the page.");
        } else if (error.name === "NotFoundError") {
          setStreamError("No camera was found on this device.");
        } else if (error.name === "NotReadableError") {
          setStreamError("The camera is already in use by another app.");
        } else {
          setStreamError("Camera access was blocked. You can still join the room.");
        }
      } else {
        setStreamError("Camera access was blocked. You can still join the room.");
      }
    } finally {
      setIsRequestingCamera(false);
    }
  };

  useEffect(() => {
    let active = true;

    const startLocalStream = async () => {
      await requestCamera();
      if (!active) {
        localStream?.getTracks().forEach((track) => track.stop());
      }
    };

    startLocalStream();

    return () => {
      active = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    attachStreamToVideo(localStream);
  }, [localStream]);

  useEffect(() => {
    const videoElement = screenShareVideoRef.current;
    if (!videoElement) return;
    videoElement.srcObject = screenShareStream;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.autoplay = true;
    if (screenShareStream) {
      videoElement.play().catch(() => undefined);
    }
  }, [screenShareStream]);

  useEffect(() => {
    if (!localStream) return;

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !isVideoOff;
    });

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !isAudioMuted;
    });
  }, [localStream, isAudioMuted, isVideoOff]);

  useEffect(() => {
    if (isVideoOff && localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
      attachStreamToVideo(null);
      return;
    }

    if (!isVideoOff && !localStream && !isRequestingCamera) {
      void requestCamera();
    }
  }, [isVideoOff, localStream, isRequestingCamera]);

  // Dynamically calculate grid columns based on total count (Zoom style)
  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2)
      return "grid-cols-1 md:grid-cols-2 grid-rows-1 md:grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6)
      return "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    if (count <= 12)
      return "grid-cols-3 md:grid-cols-4 grid-rows-4 md:grid-rows-3";
    return "grid-cols-4 md:grid-cols-5 auto-rows-fr"; // 13+ participants
  };

  return (
    <div className="w-full h-full p-4 flex flex-col justify-center items-center overflow-hidden bg-[#020617]">
      <div
        className={`w-full h-full grid gap-3 max-h-full max-w-7xl transition-all duration-300 ease-in-out ${getGridClass(
          totalCount
        )}`}
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
              {hideVideo ? (
                <div className="flex flex-col items-center justify-center space-y-2 p-4">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
                    <UserIcon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Camera Off
                  </span>
                </div>
              ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center relative">
                  {isSelfUser && screenShareStream ? (
                    <video
                      ref={screenShareVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : isSelfUser && localStream ? (
                    <video
                      ref={selfVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : isSharingThisParticipant ? (
                    <div className="flex flex-col items-center justify-center space-y-3 text-center px-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-200 text-lg font-semibold shadow-inner">
                        {initials || "S"}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Sharing screen
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 text-center px-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-200 text-lg font-semibold shadow-inner">
                        {initials || "U"}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {participant.name}
                      </span>
                    </div>
                  )}

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

              {streamError && isSelfUser && !localStream && (
                <div className="absolute inset-x-3 bottom-12 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                  <div>{streamError}</div>
                  <button
                    type="button"
                    onClick={() => void requestCamera()}
                    className="mt-2 rounded-md bg-amber-500/20 px-2 py-1 font-semibold text-amber-100 hover:bg-amber-500/30"
                  >
                    {isRequestingCamera ? "Connecting…" : "Try camera again"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
