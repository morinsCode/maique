import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import type { TrackRequest } from "../../../shared/types.ts";

type PlaylistProps = {
  songs: TrackRequest[];
  // Highlighted row. One past the end (queue ran out) highlights nothing.
  currentIndex: number;
  onSelect: (index: number) => void;
};

function Playlist({ songs, currentIndex, onSelect }: PlaylistProps) {
  return (
    <div>
      <Typography variant="h6">Playlist</Typography>
      <List dense>
        {songs.map((song, index) => (
          <ListItemButton
            key={index}
            selected={index === currentIndex}
            onClick={() => onSelect(index)}
          >
            <ListItemText primary={song.url} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );
}

export default Playlist;
