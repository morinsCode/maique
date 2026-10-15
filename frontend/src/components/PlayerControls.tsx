import { Button, Stack } from "@mui/material";

type PlayerControlsProps = {
  isPlaying: boolean;
  canGoNext: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
};

function PlayerControls({
  isPlaying,
  canGoNext,
  onPlay,
  onPause,
  onNext,
}: PlayerControlsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ padding: 2 }}>
      <Button variant="contained" onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <Button variant="outlined" onClick={onNext} disabled={!canGoNext}>
        Next
      </Button>
    </Stack>
  );
}

export default PlayerControls;
