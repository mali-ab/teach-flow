import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MeetingHeader from "../components/meetings/MeetingHeader";
import VideoGrid from "../components/meetings/VideoGrid";
import MeetingControls from "../components/meetings/MeetingControls";
import ChatSidebar from "../components/meetings/ChatSidebar";
import ParticipantsSidebar from "../components/meetings/ParticipantsSidebar";
import { JitsiRoomProvider, useJitsiRoom } from "../contexts/JitsiRoomContext";
import api from "../lib/axios";

export interface Participant {
  id: string | number;
  name: string;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isVideoOff?: boolean;
  isAudioMuted?: boolean;
  isScreenSharing?: boolean;
  avatarUrl?: string;
}

export default function MeetingRoom() {
  return (
    <JitsiRoomProvider>
      <MeetingRoomContent />
    </JitsiRoomProvider>
  );
}

function MeetingRoomContent() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { jitsiUrl, isReady, joinConference, leaveConference, toggleScreenShare, conferenceError } = useJitsiRoom();

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<"chat" | "participants" | null>(null);
  const [roomName, setRoomName] = useState<string>(id ? decodeURIComponent(id) : "TeachFlow Room");
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [displayName, setDisplayName] = useState("You");
  const [jitsiJoined, setJitsiJoined] = useState(false);

  const participantIdRef = useRef<string | null>(null);
  const [localParticipantId, setLocalParticipantId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: number; sender: string; text: string; time: string; isSelf?: boolean }>
  >([
    {
      id: 1,
      sender: "System",
      text: "Welcome to the meeting. Share notes, questions, or quick updates here.",
      time: "Now",
    },
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const getOrCreateLocalParticipantId = () => {
    const existing = participantIdRef.current ?? window.localStorage.getItem("teachflow-participant-id");
    if (existing) {
      participantIdRef.current = existing;
      return existing;
    }

    const generatedId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `participant-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    participantIdRef.current = generatedId;
    window.localStorage.setItem("teachflow-participant-id", generatedId);
    return generatedId;
  };

  const syncParticipantPresence = async (sharing: boolean) => {
    const roomId = id ? decodeURIComponent(id) : "";
    if (!roomId) return;

    const participantId = getOrCreateLocalParticipantId();
    try {
      await api.post(`/meetings/${roomId}/participants`, {
        participantId,
        isScreenSharing: sharing,
      });
    } catch {
      // ignore presence sync failures for now
    }
  };

  useEffect(() => {
    const roomId = id ? decodeURIComponent(id) : "";
    if (!roomId) {
      setError("No meeting room was provided.");
      return;
    }

    const participantId = getOrCreateLocalParticipantId();
    setLocalParticipantId(participantId);

    const localUser: Participant = {
      id: participantId,
      name: "You",
      isSelf: true,
      isAudioMuted,
      isVideoOff,
    };

    setParticipants([localUser]);

    let isActive = true;
    let pollTimer: number | undefined;

    const mergeParticipants = (
      responseParticipants: Array<{ id: string; name: string; isScreenSharing?: boolean }>
    ) => {
      const selfId = participantId;

      const remoteParticipants = responseParticipants
        .filter((p) => p.id !== selfId)
        .map((p) => ({
          id: p.id,
          name: p.name,
          isSelf: false,
          isScreenSharing: p.isScreenSharing ?? false,
        }));

      const mergedParticipants = [localUser, ...remoteParticipants];
      if (isActive) {
        setParticipants(mergedParticipants);
      }
    };

    const syncParticipants = async () => {
      if (!isActive) return;
      try {
        const response = await api.post(`/meetings/${roomId}/participants`, {
          participantId: getOrCreateLocalParticipantId(),
          isScreenSharing,
        });
        const remoteParticipants = (response.data?.participants ?? []) as Array<{
          id: string;
          name: string;
          isScreenSharing?: boolean;
        }>;
        mergeParticipants(remoteParticipants);
      } catch {
        if (isActive) setParticipants([localUser]);
      }
    };

    const refreshParticipants = async () => {
      if (!isActive) return;
      try {
        const response = await api.get(`/meetings/${roomId}/participants`);
        const remoteParticipants = (response.data?.participants ?? []) as Array<{
          id: string;
          name: string;
          isScreenSharing?: boolean;
        }>;
        mergeParticipants(remoteParticipants);
      } catch {
        if (isActive) setParticipants([localUser]);
      }
    };

    const loadMeeting = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/meetings/${roomId}/join`);
        if (!isActive) return;
        if (response.data?.url) setJoinUrl(response.data.url);
        if (response.data?.room_name) setRoomName(response.data.room_name);
        else if (response.data?.id) setRoomName(response.data.id);
      } catch (err: any) {
        if (!isActive) return;
        const message = err.response?.data?.message || "Unable to reach the meeting service.";
        setError(message);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadMeeting();
    void syncParticipants();
    void refreshParticipants();
    pollTimer = window.setInterval(() => void refreshParticipants(), 2000);

    return () => {
      isActive = false;
      if (pollTimer) window.clearInterval(pollTimer);
      const pid = participantIdRef.current;
      if (pid) void api.delete(`/meetings/${roomId}/participants/${pid}`).catch(() => undefined);
      leaveConference();
    };
  }, [id]);

  // Join Jitsi conference when joinUrl is available
  useEffect(() => {
    if (!joinUrl || jitsiJoined) return;
    setJitsiJoined(true);
    joinConference({
      roomName,
      displayName,
      url: joinUrl,
    });
  }, [joinUrl, jitsiJoined, roomName, displayName, joinConference]);

  const currentParticipants = useMemo(() => {
    if (!localParticipantId) return [];
    const localUser: Participant = {
      id: localParticipantId,
      name: "You",
      isSelf: true,
      isAudioMuted,
      isVideoOff,
      isScreenSharing,
    };
    const others = participants.filter((p) => p.id !== localParticipantId);
    return [localUser, ...others];
  }, [participants, localParticipantId, isAudioMuted, isVideoOff, isScreenSharing]);

  const activeScreenShareParticipant = useMemo(() => {
    return currentParticipants.find((p) => p.isScreenSharing);
  }, [currentParticipants]);

  const toggleSidePanel = (panel: "chat" | "participants") => {
    setActiveSidePanel((prev) => (prev === panel ? null : panel));
  };

  const handleLeave = () => {
    leaveConference();
    navigate("/dashboard");
  };

  const handleScreenShare = () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      void syncParticipantPresence(false);
    } else {
      setIsScreenSharing(true);
      void syncParticipantPresence(true);
    }
    // Jitsi handles the actual screen share via its own UI in the iframe
    toggleScreenShare();
  };

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-100 flex flex-col overflow-hidden select-none">
      <MeetingHeader
        roomName={roomName}
        duration={(() => {
          const totalSeconds = durationSeconds;
          const safeSeconds = Math.max(0, Math.floor(totalSeconds));
          const hours = Math.floor(safeSeconds / 3600);
          const minutes = Math.floor((safeSeconds % 3600) / 60);
          const seconds = safeSeconds % 60;
          const pad2 = (n: number) => String(n).padStart(2, "0");
          return hours > 0
            ? `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
            : `${pad2(minutes)}:${pad2(seconds)}`;
        })()}
        participantCount={currentParticipants.length}
        role="Host"
        isSpeaking={!isAudioMuted}
      />

      <div className="flex-1 flex overflow-hidden relative p-4 gap-4">
        <main className="flex-1 flex flex-col items-center justify-center relative rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md overflow-hidden transition-all duration-300">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-20 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {error}
            </div>
          )}

          {conferenceError && (
            <div className="absolute top-4 left-4 right-4 z-20 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {conferenceError}
            </div>
          )}

          {/* Jitsi iframe embed - fills the main area */}
          {jitsiUrl && (
            <iframe
              src={jitsiUrl}
              allow="camera; microphone; display-capture; fullscreen"
              className="w-full h-full rounded-2xl border-0"
              title="Jitsi Meeting"
            />
          )}

          {/* Show loading state while waiting */}
          {!jitsiUrl && loading && (
            <div className="text-sm text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Connecting to meeting room…</span>
            </div>
          )}

          {/* Show the participant tile grid when no iframe is present (fallback) */}
          {!jitsiUrl && !loading && (
            <VideoGrid
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isScreenSharing={isScreenSharing}
              activeScreenShareParticipantId={activeScreenShareParticipant?.id ?? null}
              participants={currentParticipants}
            />
          )}
        </main>

        {activeSidePanel === "chat" && (
          <ChatSidebar
            messages={chatMessages}
            onSendMessage={(text) => {
              const newMessage = {
                id: Date.now(),
                sender: "You",
                text,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isSelf: true,
              };
              setChatMessages((prev) => [...prev, newMessage]);
            }}
            onClose={() => setActiveSidePanel(null)}
          />
        )}
        {activeSidePanel === "participants" && (
          <ParticipantsSidebar
            participants={currentParticipants}
            onClose={() => setActiveSidePanel(null)}
          />
        )}
      </div>

      <MeetingControls
        isAudioMuted={isAudioMuted}
        setIsAudioMuted={setIsAudioMuted}
        isVideoOff={isVideoOff}
        setIsVideoOff={setIsVideoOff}
        isScreenSharing={isScreenSharing}
        setIsScreenSharing={handleScreenShare}
        activeSidePanel={activeSidePanel}
        toggleSidePanel={toggleSidePanel}
        onLeave={handleLeave}
      />
    </div>
  );
}

