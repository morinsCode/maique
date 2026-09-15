import type { Service } from "../components/types";

export function detectService(url: string): Service | null {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/soundcloud\.com/.test(url)) return "soundcloud";
  return null;
}
