import { Button, Stack, TextField, Typography } from "@mui/material";
import DjUI from "../components/DjUI.tsx";
import TrackUrlForm from "../components/TrackUrlForm.tsx";
import Playlist from "../components/Playlist.tsx";
import PlayerControls from "../components/PlayerControls.tsx";
import PlayerHosts from "../playback/PlayerHosts.tsx";
import { usePlaybackController } from "../playback/usePlaybackController.ts";
import type { TrackRequest } from "../../../shared/types.ts";

type DjPageProps = {
  roomId: string;
  requests: TrackRequest[];
  playlist: TrackRequest[];
  onApprove: (index: number) => void;
  onRemove: (index: number) => void;
  onAddToPlaylist: (track: TrackRequest) => void;
};

function DjPage({
  roomId,
  requests,
  playlist,
  onApprove,
  onRemove,
  onAddToPlaylist,
}: DjPageProps) {
  const playback = usePlaybackController(playlist);

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
      <TrackUrlForm
        title="Add to playlist"
        submitLabel="Add"
        guest="DJ"
        onSubmit={onAddToPlaylist}
      />
      <DjUI requests={requests} onApprove={onApprove} onRemove={onRemove} />
      <Playlist songs={playlist} />
      {playback.currentTrack ? (
        <PlayerControls
          isPlaying={playback.isPlaying}
          isBlocked={playback.isBlocked}
          canGoNext={playback.canGoNext}
          onPlay={playback.play}
          onPause={playback.pause}
          onNext={playback.next}
        />
      ) : (
        <Typography sx={{ padding: 2 }}>
          Waiting for the next approved track…
        </Typography>
      )}
      <PlayerHosts {...playback.hostProps} />
    </>
  );
}

export default DjPage;
