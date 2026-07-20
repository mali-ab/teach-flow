import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type JitsiContextValue = {
  /** The Jitsi iframe URL to embed directly */
  jitsiUrl: string | null;
  isReady: boolean;
  conferenceError: string | null;
  joinConference: (options: {
    roomName: string;
    displayName: string;
    url: string;
  }) => void;
  leaveConference: () => void;
  toggleScreenShare: () => void;
};

const JitsiRoomContext = createContext<JitsiContextValue | undefined>(undefined);

export function useJitsiRoom() {
  const ctx = useContext(JitsiRoomContext);
  if (!ctx) throw new Error("useJitsiRoom must be used within JitsiRoomProvider");
  return ctx;
}

export function JitsiRoomProvider({ children }: { children: React.ReactNode }) {
  const [jitsiUrl, setJitsiUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [conferenceError, setConferenceError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const leaveConference = useCallback(() => {
    setJitsiUrl(null);
    setIsReady(false);
    setConferenceError(null);
  }, []);

  const joinConference = useCallback(
    ({ roomName, displayName, url }: { roomName: string; displayName: string; url: string }) => {
      setConferenceError(null);
      setIsReady(false);

      try {
        // Build the Jitsi URL with config parameters for a clean embed
        const jitsiUrlObj = new URL(url);

        // Add config parameters
        jitsiUrlObj.searchParams.set("jwt", "");
        jitsiUrlObj.searchParams.set("config.prejoinPageEnabled", "false");
        jitsiUrlObj.searchParams.set("config.disableDeepLinking", "true");
        jitsiUrlObj.searchParams.set("interfaceConfig.DEFAULT_BACKGROUND", "#020617");
        jitsiUrlObj.searchParams.set("interfaceConfig.SHOW_JITSI_WATERMARK", "false");
        jitsiUrlObj.searchParams.set("interfaceConfig.SHOW_WATERMARK_FOR_GUESTS", "false");
        jitsiUrlObj.searchParams.set("interfaceConfig.TOOLBAR_ALWAYS_VISIBLE", "false");
        jitsiUrlObj.searchParams.set("userInfo.displayName", displayName);

        const finalUrl = jitsiUrlObj.toString();
        setJitsiUrl(finalUrl);

        // Wait for the iframe to load, then set ready
        // The iframe will be rendered by the consumer
        setIsReady(true);
      } catch (e: any) {
        setConferenceError(e?.message || "Failed to build Jitsi meeting URL.");
      }
    },
    []
  );

  const toggleScreenShare = useCallback(() => {
    // When using direct iframe embed, screen share is handled by Jitsi's own UI
    // No additional API call needed
  }, []);

  useEffect(() => {
    return () => {
      leaveConference();
    };
  }, [leaveConference]);

  const value = useMemo<JitsiContextValue>(
    () => ({
      jitsiUrl,
      isReady,
      conferenceError,
      joinConference,
      leaveConference,
      toggleScreenShare,
    }),
    [jitsiUrl, isReady, conferenceError, joinConference, leaveConference, toggleScreenShare]
  );

  return (
    <JitsiRoomContext.Provider value={value}>
      {children}
    </JitsiRoomContext.Provider>
  );
}
