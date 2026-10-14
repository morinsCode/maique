import { Button, Stack } from "@mui/material";

type PlayerControlsProps = {
  onPlay: () => void;
  onPause: () => void;
};

function PlayerControls({ onPlay, onPause }: PlayerControlsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ padding: 2 }}>
      <Button variant="contained" onClick={onPlay}>
        Play
      </Button>
      <Button variant="outlined" onClick={onPause}>
        Pause
      </Button>
    </Stack>
  );
}

export default PlayerControls;
