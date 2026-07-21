import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface JitsiMeetingRoomProps {
  roomName: string;
  displayName: string;
  serverUrl: string;
  onLeave?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

function loadJitsiScript(origin: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="/external_api.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load script")));
      return;
    }
    const script = document.createElement("script");
    script.src = `${origin}/external_api.js`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Jitsi script from ${origin}`));
    document.head.appendChild(script);
  });
}

export default function JitsiMeetingRoom({
  roomName,
  displayName,
  serverUrl,
  onLeave,
}: JitsiMeetingRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const initJitsi = async () => {
      try {
        const parsed = new URL(serverUrl);
        const origin = parsed.origin;
        const host = parsed.host;

        await loadJitsiScript(origin);

        if (!isMounted) return;

        const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
        if (!JitsiMeetExternalAPI) {
          console.error("JitsiMeetExternalAPI not available");
          return;
        }

        const api = new JitsiMeetExternalAPI(host, {
          roomName,
          parentNode: containerRef.current,
          userInfo: { displayName },
          configOverwrite: {
            disableDeepLinking: true,
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableThirdPartyRequests: true,
          },
          interfaceConfigOverwrite: {
            DEFAULT_BACKGROUND: "#020617",
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            FILM_STRIP_MAX_HEIGHT: 120,
          },
        });

        apiRef.current = api;

        api.addEventListener("readyToClose", () => {
          console.log("Jitsi readyToClose");
          handleLeave();
        });

        api.addEventListener("videoConferenceLeft", () => {
          console.log("Jitsi videoConferenceLeft");
          handleLeave();
        });
      } catch (err) {
        console.error("Failed to initialize Jitsi:", err);
      }
    };

    const handleLeave = () => {
      if (onLeave) {
        onLeave();
      } else {
        navigate("/dashboard");
      }
    };

    initJitsi();

    return () => {
      isMounted = false;
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {
          // ignore
        }
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, serverUrl, navigate, onLeave]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "100vh", minWidth: "100%" }}
    />
  );
}

