import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import type { PlaylistEntry } from "../../../shared/types.ts";

type PlaylistProps = {
  songs: PlaylistEntry[];
  // Highlighted row. One past the end (queue ran out) highlights nothing.
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
};

function Playlist({ songs, currentIndex, onSelect, onRemove }: PlaylistProps) {
  return (
    <div>
      <Typography variant="h6">Playlist</Typography>
      <List dense>
        {songs.map((song, index) => (
          // The Delete button sits beside the row's button, not inside it:
          // a button inside a button is invalid HTML, and the click would
          // also select the song.
          <ListItem
            key={song.id}
            disablePadding
            secondaryAction={
              <Button size="small" onClick={() => onRemove(song.id)}>
                Delete
              </Button>
            }
          >
            <ListItemButton
              selected={index === currentIndex}
              onClick={() => onSelect(index)}
            >
              <ListItemText primary={song.url} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default Playlist;
