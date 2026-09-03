import { TextField, Typography } from "@mui/material";

function Playlist() {
  return (
    <div>
      {/* Playlist component content goes here */}
      <Typography variant="h6">Playlist</Typography>
      <TextField label="Add a new song" variant="outlined" fullWidth />
    </div>
  );
}

export default Playlist;
