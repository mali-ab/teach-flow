import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useJitsiRoom } from "../contexts/JitsiRoomContext";

import MeetingHeader from "../components/meetings/MeetingHeader";
import MeetingControls from "../components/meetings/MeetingControls";
import ChatSidebar from "../components/meetings/ChatSidebar";
import ParticipantsSidebar from "../components/meetings/ParticipantsSidebar";

interface Participant {
  id: number | string;
  name: string;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isVideoOff: boolean;
  isAudioMuted: boolean;
  isScreenSharing: boolean;
}

export default function MeetingRoom() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    participants: jitsiParticipants,
    localParticipantId,
    isConnected,
    conferenceError,
    kickedOut,
    joinConference,
    leaveConference,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    isAudioMuted: jitsiAudioMuted,
    isVideoOff: jitsiVideoOff,
    isScreenSharing: jitsiScreenSharing,
    containerRef,
    chatMessages: jitsiChatMessages,
    sendChatMessage,
  } = useJitsiRoom();

  const [activeSidePanel, setActiveSidePanel] = useState<
    "chat" | "participants" | null
  >(null);
  const [roomName, setRoomName] = useState<string>(
    id ? decodeURIComponent(id) : "TeachFlow Room",
  );
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [jitsiJoined, setJitsiJoined] = useState(false);

  const displayName = useMemo(() => user?.name || "You", [user]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setDurationSeconds((prev) => prev + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const roomId = id ? decodeURIComponent(id) : "";
    if (!roomId) {
      setError("No meeting room was provided.");
      return;
    }
    let isActive = true;

    const loadMeeting = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/meetings/join/${roomId}`);
        if (!isActive) return;

        if (response.data?.room?.join_url)
          setJoinUrl(response.data.room.join_url);
        if (response.data?.room?.room_name)
          setRoomName(response.data.room.room_name);
      } catch (err: unknown) {
        if (!isActive) return;

        // Check if the error returned from the API is a 404 Not Found
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            // Redirect immediately to the 404 route
            // Setting { replace: true } prevents the broken link from cluttering browser history
            navigate("/404", { replace: true });
            return;
          }
        }

        // Fallback error behavior for non-404 errors (network issues, 500 server errors, etc.)
        setError("Unable to reach the meeting service.");
        setJoinUrl("https://meet.jit.si");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadMeeting();
    return () => {
      isActive = false;
      leaveConference();
    };
  }, [id, leaveConference]);

  useEffect(() => {
    if (!joinUrl || jitsiJoined) return;
    setJitsiJoined(true);
    joinConference({ roomName, displayName, url: joinUrl });
  }, [joinUrl, jitsiJoined, roomName, displayName, joinConference]);

  useEffect(() => {
    if (kickedOut) {
      navigate("/", { replace: true });
    }
  }, [kickedOut, navigate]);

  const currentParticipants = useMemo<Participant[]>(() => {
    return jitsiParticipants.map((jp) => ({
      id: jp.id,
      name:
        jp.displayName ||
        (jp.id === localParticipantId ? displayName : "Guest"),
      isSelf: jp.id === localParticipantId,
      isSpeaking: false,
      isVideoOff: jp.isVideoOff,
      isAudioMuted: jp.isAudioMuted,
      isScreenSharing: jp.isScreenSharing,
    }));
  }, [jitsiParticipants, localParticipantId, displayName]);

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-100 flex flex-col overflow-hidden select-none">
      <MeetingHeader
        roomName={roomName}
        duration={(() => {
          const m = Math.floor((durationSeconds % 3600) / 60);
          const s = durationSeconds % 60;
          return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        })()}
        participantCount={currentParticipants.length}
        role="Participant"
        isSpeaking={!jitsiAudioMuted}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div
          ref={containerRef}
          id="jitsi-meet-container"
          className="absolute inset-0 w-full h-full"
        />

        <div className="absolute top-4 left-6 z-10 pointer-events-none flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="TeachFlow Logo"
            className="h-20 w-auto object-contain drop-shadow-md"
          />
        </div>

        {error && (
          <div className="absolute top-4 left-4 right-4 z-30 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}
        {conferenceError && (
          <div className="absolute top-4 left-4 right-4 z-30 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {conferenceError}
          </div>
        )}

        {loading && !isConnected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm">
            <div className="text-sm text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Connecting to meeting room...</span>
            </div>
          </div>
        )}

        <div className="absolute top-0 right-0 h-full z-30 p-4">
          {activeSidePanel === "chat" && (
            <ChatSidebar
              messages={jitsiChatMessages}
              onSendMessage={sendChatMessage}
              onClose={() => setActiveSidePanel(null)}
            />
          )}

          {activeSidePanel === "participants" && (
            <ParticipantsSidebar
              participants={currentParticipants as any}
              onClose={() => setActiveSidePanel(null)}
            />
          )}
        </div>
      </div>

      <MeetingControls
        isAudioMuted={jitsiAudioMuted}
        setIsAudioMuted={toggleAudio}
        isVideoOff={jitsiVideoOff}
        setIsVideoOff={toggleVideo}
        isScreenSharing={jitsiScreenSharing}
        setIsScreenSharing={toggleScreenShare}
        activeSidePanel={activeSidePanel}
        toggleSidePanel={(panel) =>
          setActiveSidePanel((prev) => (prev === panel ? null : panel))
        }
        onLeave={() => {
          leaveConference();
          navigate("/");
        }}
      />
    </div>
  );
}
