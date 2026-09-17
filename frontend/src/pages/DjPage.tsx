import { Button } from "@mui/material";
import DjUI from "../components/DjUI.tsx";
import Playlist from "../components/Playlist.tsx";
import YouTubePlayer from "../components/YouTubePlayer.tsx";
import SoundCloudPlayer from "../components/SoundCloudPlayer.tsx";
import type { TrackRequest } from "../components/types.ts";
import { extractYouTubeVideoId } from "../providers/youtube.ts";

type DjPageProps = {
  requests: TrackRequest[];
  playlist: TrackRequest[];
  currentSong: TrackRequest | undefined;
  soundEnabled: boolean;
  onApprove: (index: number) => void;
  onRemove: (index: number) => void;
  onEnableSound: () => void;
  onEnded: () => void;
};

function DjPage({
  requests,
  playlist,
  currentSong,
  soundEnabled,
  onApprove,
  onRemove,
  onEnableSound,
  onEnded,
}: DjPageProps) {
  return (
    <>
      <DjUI requests={requests} onApprove={onApprove} onRemove={onRemove} />
      <Playlist songs={playlist} />
      {!soundEnabled && (
        <Button variant="outlined" onClick={onEnableSound}>
          Enable sound
        </Button>
      )}
      {currentSong?.service === "youtube" && (
        <YouTubePlayer
          videoId={extractYouTubeVideoId(currentSong.url) ?? ""}
          soundEnabled={soundEnabled}
          onEnded={onEnded}
        />
      )}
      {currentSong?.service === "soundcloud" && (
        <SoundCloudPlayer
          url={currentSong.url}
          soundEnabled={soundEnabled}
          onEnded={onEnded}
        />
      )}
    </>
  );
}

export default DjPage;
