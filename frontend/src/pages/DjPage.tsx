import { useEffect, useRef, useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import DjUI from "../components/DjUI.tsx";
import Playlist from "../components/Playlist.tsx";
import PlayerControls from "../components/PlayerControls.tsx";
import SoundCloudPlayer from "../components/SoundCloudPlayer.tsx";
import PlayerHosts from "../playback/PlayerHosts.tsx";
import type { PlayerAdapters } from "../playback/types.ts";
import type { TrackRequest } from "../../../shared/types.ts";

type DjPageProps = {
  roomId: string;
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
  roomId,
  requests,
  playlist,
  currentSong,
  soundEnabled,
  onApprove,
  onRemove,
  onEnableSound,
  onEnded,
}: DjPageProps) {
  const [adapters, setAdapters] = useState<PlayerAdapters | null>(null);
  const youtube = adapters?.youtube;

  // Room state arrives as fresh objects on every WebSocket update, so we key
  // loading on the URL (which only changes when the track really changes)
  // and read the latest song object through a ref.
  const currentSongRef = useRef(currentSong);
  useEffect(() => {
    currentSongRef.current = currentSong;
  });
  const youtubeUrl =
    currentSong?.service === "youtube" ? currentSong.url : null;

  useEffect(() => {
    const song = currentSongRef.current;
    if (!youtube || !youtubeUrl || !song) return;
    youtube.load(song, { autoplay: false }).catch(console.error);
  }, [youtube, youtubeUrl]);

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        sx={{ padding: 2, alignItems: "center" }}
      >
        <Typography>Room code:</Typography>
        <TextField
          size="small"
          value={roomId}
          slotProps={{ htmlInput: { readOnly: true } }}
        />
        <Button
          variant="outlined"
          onClick={() => navigator.clipboard.writeText(roomId)}
        >
          Copy
        </Button>
      </Stack>
      <DjUI requests={requests} onApprove={onApprove} onRemove={onRemove} />
      <Playlist songs={playlist} />
      {!soundEnabled && (
        <Button variant="outlined" onClick={onEnableSound}>
          Enable sound
        </Button>
      )}
      {currentSong?.service === "youtube" && youtube && (
        <PlayerControls
          onPlay={() => youtube.play().catch(console.error)}
          onPause={() => youtube.pause().catch(console.error)}
        />
      )}
      <PlayerHosts onAdapters={setAdapters} />
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
