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

  // What the player is actually doing (from its events), versus what the DJ
  // asked for (from button clicks). After a track ends, the next one starts
  // by itself only if the DJ hadn't paused.
  const [isPlaying, setIsPlaying] = useState(false);
  const wantsToPlayRef = useRef(false);

  useEffect(() => {
    const song = currentSongRef.current;
    if (!youtube || !youtubeUrl || !song) return;
    youtube
      .load(song, { autoplay: wantsToPlayRef.current })
      .catch(console.error);
  }, [youtube, youtubeUrl]);

  useEffect(() => {
    if (!youtube) return;
    // subscribe() returns the unsubscribe function, which React then calls
    // as this effect's cleanup.
    return youtube.subscribe((event) => {
      if (event.type === "playing") setIsPlaying(true);
      if (event.type === "paused") setIsPlaying(false);
      if (event.type === "ended" || event.type === "error") {
        if (event.type === "error") console.error(event.message);
        setIsPlaying(false);
        onEnded();
      }
    });
  }, [youtube, onEnded]);

  function handlePlay() {
    wantsToPlayRef.current = true;
    youtube?.play().catch(console.error);
  }

  function handlePause() {
    wantsToPlayRef.current = false;
    youtube?.pause().catch(console.error);
  }

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
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
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
