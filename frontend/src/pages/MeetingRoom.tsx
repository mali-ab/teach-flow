import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MeetingHeader from "../components/meetings/MeetingHeader";
import VideoGrid from "../components/meetings/VideoGrid";
import MeetingControls from "../components/meetings/MeetingControls";
import ChatSidebar from "../components/meetings/ChatSidebar";
import ParticipantsSidebar from "../components/meetings/ParticipantsSidebar";
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
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<
    "chat" | "participants" | null
  >(null);
  const [roomName, setRoomName] = useState<string>(id ? decodeURIComponent(id) : "TeachFlow Room");
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const participantIdRef = useRef<string | null>(null);
  const [localParticipantId, setLocalParticipantId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; sender: string; text: string; time: string; isSelf?: boolean }>>([

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

    const mergeParticipants = (responseParticipants: Array<{ id: string; name: string; isScreenSharing?: boolean }>) => {
      const participantId = getOrCreateLocalParticipantId();
      const remoteParticipants = responseParticipants
        .filter((participant) => participant.id !== participantId)

        .map((participant) => ({
          id: participant.id,
          name: participant.name,
          isSelf: false,
          isScreenSharing: participant.isScreenSharing ?? false,
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

        const remoteParticipants = (response.data?.participants ?? []) as Array<{ id: string; name: string; isScreenSharing?: boolean }>;
        mergeParticipants(remoteParticipants);
      } catch {
        if (isActive) {
          setParticipants([localUser]);
        }
      }
    };

    const refreshParticipants = async () => {
      if (!isActive) return;

      try {
        const response = await api.get(`/meetings/${roomId}/participants`);
        const remoteParticipants = (response.data?.participants ?? []) as Array<{ id: string; name: string; isScreenSharing?: boolean }>;
        mergeParticipants(remoteParticipants);
      } catch {
        if (isActive) {
          setParticipants([localUser]);
        }
      }
    };

    const loadMeeting = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/meetings/${roomId}/join`);
        if (!isActive) return;

        if (response.data?.url) {
          setJoinUrl(response.data.url);
        }
        if (response.data?.room_name) {
          setRoomName(response.data.room_name);
        } else if (response.data?.id) {
          setRoomName(response.data.id);
        }
      } catch (err: any) {
        if (!isActive) return;
        const message =
          err.response?.data?.message ||
          "Unable to reach the meeting service. You can still use the local room view.";
        setError(message);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadMeeting();
    void syncParticipants();
    void refreshParticipants();
    pollTimer = window.setInterval(() => {
      void refreshParticipants();
    }, 2000);

    return () => {
      isActive = false;
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }

      const participantId = participantIdRef.current;
      if (participantId) {
        void api.delete(`/meetings/${roomId}/participants/${participantId}`).catch(() => undefined);
      }
    };
  }, [id]);

  const currentParticipants = useMemo(() => {
    const localUser: Participant = {
      id: localParticipantId ?? "local-user",
      name: "You",
      isSelf: true,
      isAudioMuted,
      isVideoOff,
      isScreenSharing,
    };


    const others = participants.filter((p) => !p.isSelf && p.id !== localUser.id);
    return [localUser, ...others];

  }, [participants, isAudioMuted, isVideoOff, isScreenSharing]);

  const activeScreenShareParticipant = useMemo(() => {
    return currentParticipants.find((participant) => participant.isScreenSharing);
  }, [currentParticipants]);

  const toggleSidePanel = (panel: "chat" | "participants") => {
    setActiveSidePanel((prev) => (prev === panel ? null : panel));
  };

  const handleLeave = () => {
    navigate("/dashboard");
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
      }
      setScreenShareStream(null);
      void syncParticipantPresence(false);
      return;
    }

    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
        setError("Screen sharing is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      setScreenShareStream(stream);
      setIsScreenSharing(true);
      setError(null);
      void syncParticipantPresence(true);
      stream.getVideoTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          setIsScreenSharing(false);
          setScreenShareStream(null);
          void syncParticipantPresence(false);
        });
      });
    } catch {
      setError("Screen sharing was cancelled.");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Header with live participant count */}
      <MeetingHeader
        roomName={roomName}
        duration={new Date(durationSeconds * 1000).toISOString().slice(14, 19)}
        participantCount={currentParticipants.length}
        role="Host"
        isSpeaking={!isAudioMuted}
      />

      {/* Main Workspace: Video Grid / Presentation View + Optional Drawer */}
      <div className="flex-1 flex overflow-hidden relative p-4 gap-4">
        {/* Central Video Area */}
        <main className="flex-1 flex flex-col items-center justify-center relative rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md overflow-hidden transition-all duration-300">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-10 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {error}
            </div>
          )}

          {loading && !joinUrl && (
            <div className="text-sm text-slate-400">Connecting to meeting room…</div>
          )}

          <VideoGrid
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            activeScreenShareParticipantId={activeScreenShareParticipant?.id ?? null}
            screenShareStream={screenShareStream}
            participants={currentParticipants}
          />

          {joinUrl && (
            <div className="absolute bottom-4 right-4 rounded-xl border border-blue-500/30 bg-blue-600/10 px-4 py-2 text-sm text-blue-200 shadow-lg shadow-blue-950/20">
              Room ready: {roomName}
            </div>
          )}
        </main>

        {/* Dynamic Side Drawer */}
        {activeSidePanel === "chat" && (
          <ChatSidebar
            messages={chatMessages}
            onSendMessage={(text) => {
              const newMessage = {
                id: Date.now(),
                sender: "You",
                text,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

      {/* Bottom Floating Controls Bar */}
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
