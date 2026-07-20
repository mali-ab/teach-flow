import React, { useEffect, useRef } from "react";

interface JitsiContainerProps {
  roomUrl: string;
  roomName: string;
  displayName: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

export default function JitsiContainer({ roomUrl, roomName, displayName }: JitsiContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    const JitsiMeetExternalAPI = window.JitsiMeetExternalAPI;
    if (!JitsiMeetExternalAPI) return;

    if (apiRef.current) {
      try {
        apiRef.current.dispose();
      } catch {
        // ignore
      }
      apiRef.current = null;
    }

    const origin = new URL(roomUrl).origin;

    apiRef.current = new JitsiMeetExternalAPI(origin, {
      roomName,
      parentNode: containerRef.current,
      userInfo: { displayName },
      configOverwrite: {
        disableDeepLinking: true,
      },
    });

    return () => {
      try {
        apiRef.current?.dispose();
      } catch {
        // ignore
      }
      apiRef.current = null;
    };
  }, [roomUrl, roomName, displayName]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

