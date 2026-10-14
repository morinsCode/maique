import { useEffect, useRef } from "react";
import { createYouTubeAdapter } from "../providers/youtubeAdapter.ts";
import type { PlayerAdapters } from "./types.ts";

type PlayerHostsProps = {
  // Receives the adapters once they're created, and null when they're torn
  // down. Must be a stable function (e.g. a useState setter).
  onAdapters: (adapters: PlayerAdapters | null) => void;
};

// Renders one empty container per provider and creates that provider's
// adapter inside it. React only owns the containers; each adapter owns
// whatever iframe it puts inside its container.
function PlayerHosts({ onAdapters }: PlayerHostsProps) {
  const youtubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adapters: PlayerAdapters = {
      youtube: createYouTubeAdapter(youtubeRef.current!),
    };
    onAdapters(adapters);

    return () => {
      Object.values(adapters).forEach((adapter) => adapter?.destroy());
      onAdapters(null);
    };
  }, [onAdapters]);

  return <div ref={youtubeRef} />;
}

export default PlayerHosts;
