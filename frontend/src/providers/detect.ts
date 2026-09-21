import type { Service } from "../../../shared/types.ts";

export function detectService(url: string): Service | null {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/soundcloud\.com/.test(url)) return "soundcloud";
  return null;
}
