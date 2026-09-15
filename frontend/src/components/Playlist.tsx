import { Typography } from "@mui/material";
import type { TrackRequest } from "./types";

type PlaylistProps = {
  songs: TrackRequest[];
};

function Playlist({ songs }: PlaylistProps) {
  return (
    <div>
      <Typography variant="h6">Playlist</Typography>
      {/* <TextField label="Add a new song" variant="outlined" fullWidth /> */}
      <ul>
        {songs.map((song, index) => (
          <li key={index}>{song.url}</li>
        ))}
      </ul>
    </div>
  );
}

export default Playlist;
