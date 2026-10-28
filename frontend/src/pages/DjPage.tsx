import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import GuestRequests from "../components/GuestRequests.tsx";
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
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ padding: 2, alignItems: "flex-start" }}
      >
        <Box>
          <PlayerHosts {...playback.hostProps} />
        </Box>
        <GuestRequests
          requests={requests}
          onApprove={onApprove}
          onRemove={onRemove}
        />
      </Stack>
      {playback.currentTrack ? (
        <PlayerControls
          isPlaying={playback.isPlaying}
          isBlocked={playback.isBlocked}
          canGoNext={playback.canGoNext}
          canGoPrevious={playback.canGoPrevious}
          onPlay={playback.play}
          onPause={playback.pause}
          onNext={playback.next}
          onPrevious={playback.previous}
        />
      ) : (
        <Stack
          direction="row"
          spacing={1}
          sx={{ padding: 2, alignItems: "center" }}
        >
          {/* After the queue has run out, the DJ can still go back. */}
          {playback.canGoPrevious && (
            <Button variant="outlined" onClick={playback.previous}>
              Previous
            </Button>
          )}
          <Typography>Waiting for the next approved track…</Typography>
        </Stack>
      )}
      <TrackUrlForm
        title="Add to playlist"
        submitLabel="Add"
        guest="DJ"
        onSubmit={onAddToPlaylist}
      />
      <Playlist
        songs={playlist}
        currentIndex={playback.currentIndex}
        onSelect={playback.playAt}
      />
    </>
  );
}

export default DjPage;
