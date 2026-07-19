import { useState } from "react";
import MeetingHeader from "../components/meetings/MeetingHeader";
import VideoGrid from "../components/meetings/VideoGrid";
import MeetingControls from "../components/meetings/MeetingControls";
import ChatSidebar from "../components/meetings/ChatSidebar";
import ParticipantsSidebar from "../components/meetings/ParticipantsSidebar";

export interface Participant {
  id: string | number;
  name: string;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isVideoOff?: boolean;
  isAudioMuted?: boolean;
  avatarUrl?: string;
}

export default function MeetingRoom() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<
    "chat" | "participants" | null
  >(null);

  // Centralized Participants State
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "You (Host)",
      isSelf: true,
      isAudioMuted: false,
      isVideoOff: false,
    },
    {
      id: "2",
      name: "Dr. Sarah Jenkins",
      isSpeaking: true,
      isAudioMuted: false,
      isVideoOff: false,
    },
    {
      id: "3",
      name: "Alex Rivera",
      isSpeaking: false,
      isAudioMuted: true,
      isVideoOff: true,
    },
    {
      id: "4",
      name: "Elena Rostova",
      isSpeaking: false,
      isAudioMuted: false,
      isVideoOff: false,
    },
    {
      id: "5",
      name: "Marcus Vance",
      isSpeaking: false,
      isAudioMuted: true,
      isVideoOff: false,
    },
    {
      id: "6",
      name: "Sofia Chen",
      isSpeaking: false,
      isAudioMuted: false,
      isVideoOff: true,
    },
  ]);

  // Keep 'You (Host)' synced with bottom controls state
  const currentParticipants = participants.map((p) =>
    p.isSelf ? { ...p, isAudioMuted, isVideoOff } : p
  );

  const toggleSidePanel = (panel: "chat" | "participants") => {
    setActiveSidePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Header with live participant count */}
      <MeetingHeader
        roomName="CS-101: Distributed Systems"
        duration="45:12"
        participantCount={currentParticipants.length}
      />

      {/* Main Workspace: Video Grid / Presentation View + Optional Drawer */}
      <div className="flex-1 flex overflow-hidden relative p-4 gap-4">
        {/* Central Video Area */}
        <main className="flex-1 flex items-center justify-center relative rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md overflow-hidden transition-all duration-300">
          <VideoGrid
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            participants={currentParticipants}
          />
        </main>

        {/* Dynamic Side Drawer */}
        {activeSidePanel === "chat" && (
          <ChatSidebar onClose={() => setActiveSidePanel(null)} />
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
        setIsScreenSharing={setIsScreenSharing}
        activeSidePanel={activeSidePanel}
        toggleSidePanel={toggleSidePanel}
      />
    </div>
  );
}
