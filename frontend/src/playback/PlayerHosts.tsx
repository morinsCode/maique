import { useEffect, useRef, type CSSProperties } from "react";
import type { Service } from "../../../shared/types.ts";
import { createSoundCloudAdapter } from "../providers/soundcloudAdapter.ts";
import { createYouTubeAdapter } from "../providers/youtubeAdapter.ts";
import type { PlayerAdapters } from "./types.ts";

type PlayerHostsProps = {
  // Which provider's player should be visible; the others are parked.
  activeService: Service | undefined;
  // Receives the adapters once they're created, and null when they're torn
  // down. Must be a stable function (e.g. a useState setter).
  onAdapters: (adapters: PlayerAdapters | null) => void;
};

// Inactive players stay on the page but invisible and unclickable. Not
// display: none — embedded players can fail to start up inside a hidden
// element, and browsers may throttle iframes that aren't laid out.
const parked: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
};

// Renders one empty container per provider and creates that provider's
// adapter inside it. React only owns the containers; each adapter owns
// whatever iframe it puts inside its container.
function PlayerHosts({ activeService, onAdapters }: PlayerHostsProps) {
  const youtubeRef = useRef<HTMLDivElement>(null);
  const soundcloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adapters: PlayerAdapters = {
      youtube: createYouTubeAdapter(youtubeRef.current!),
      soundcloud: createSoundCloudAdapter(soundcloudRef.current!),
    };
    onAdapters(adapters);

    return () => {
      Object.values(adapters).forEach((adapter) => adapter?.destroy());
      onAdapters(null);
    };
  }, [onAdapters]);

  return (
    <>
      <div
        ref={youtubeRef}
        style={activeService === "youtube" ? undefined : parked}
      />
      <div
        ref={soundcloudRef}
        style={activeService === "soundcloud" ? undefined : parked}
      />
    </>
  );
}

export default PlayerHosts;
