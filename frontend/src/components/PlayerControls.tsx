import { Button, Stack } from "@mui/material";

type PlayerControlsProps = {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
};

function PlayerControls({ isPlaying, onPlay, onPause }: PlayerControlsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ padding: 2 }}>
      <Button variant="contained" onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </Stack>
  );
}

export default PlayerControls;
