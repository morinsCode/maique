import { Button, Stack, Typography } from "@mui/material";

type PlayerControlsProps = {
  isPlaying: boolean;
  isBlocked: boolean;
  canGoNext: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
};

function PlayerControls({
  isPlaying,
  isBlocked,
  canGoNext,
  onPlay,
  onPause,
  onNext,
}: PlayerControlsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ padding: 2, alignItems: "center" }}>
      <Button variant="contained" onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <Button variant="outlined" onClick={onNext} disabled={!canGoNext}>
        Next
      </Button>
      {isBlocked && (
        <Typography color="warning.main">
          Playback didn't start — press Play to start it.
        </Typography>
      )}
    </Stack>
  );
}

export default PlayerControls;
