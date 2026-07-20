import React, { useEffect, useMemo, useRef, useState } from "react";

type Tile = {
  id: string;
  participantName?: string;
  videoEl?: HTMLVideoElement | null;
};

interface JitsiTileGridProps {
  participants: Array<{ id: string | number; name: string; isScreenSharing?: boolean }>;
}

/**
 * Placeholder tile grid for custom UI.
 * In a full implementation, we would map Jitsi tracks/participants to video elements.
 * For now it keeps layout stable while integrating Jitsi in your container.
 */
export default function JitsiTileGrid(_props: JitsiTileGridProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const n = _props.participants?.length ?? 0;
    setCount(n);
  }, [_props.participants]);

  const gridClass = useMemo(() => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-2 md:grid-cols-2";
    if (count <= 6) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-2 md:grid-cols-4";
  }, [count]);

  return (
    <div
      ref={ref}
      className={`w-full h-full p-4 bg-[#020617] grid gap-3 ${gridClass} overflow-hidden`}
    >
      {/* The actual video is rendered inside Jitsi's own iframe/container. */}
      <div className="col-span-full text-xs text-slate-400 flex items-center justify-center">
        Jitsi conference video is embedded below.
      </div>
    </div>
  );
}

