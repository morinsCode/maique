import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PlaylistEntry } from "../../../shared/types.ts";

type PlaylistProps = {
  songs: PlaylistEntry[];
  // Highlighted row. One past the end (queue ran out) highlights nothing.
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, toIndex: number) => void;
};

function Playlist({
  songs,
  currentIndex,
  onSelect,
  onRemove,
  onMove,
}: PlaylistProps) {
  // Mouse/touch dragging, plus keyboard: focus a grip, Space to pick up,
  // arrow keys to move, Space to drop.
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const toIndex = songs.findIndex((song) => song.id === over.id);
    onMove(String(active.id), toIndex);
  }

  return (
    <div>
      <Typography variant="h6">Playlist</Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={songs.map((song) => song.id)}
          strategy={verticalListSortingStrategy}
        >
          <List dense>
            {songs.map((song, index) => (
              <SortableRow
                key={song.id}
                song={song}
                selected={index === currentIndex}
                onSelect={() => onSelect(index)}
                onRemove={() => onRemove(song.id)}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>
    </div>
  );
}

type SortableRowProps = {
  song: PlaylistEntry;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
};

// One playlist row. Only the ☰ grip starts a drag, so clicking the row still
// plays the song and scrolling on a phone isn't taken for a drag. The grip
// and the Delete button sit beside the row's button, not inside it: a button
// inside a button is invalid HTML, and the click would also select the song.
function SortableRow({ song, selected, onSelect, onRemove }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: song.id });

  return (
    <ListItem
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      disablePadding
      secondaryAction={
        <Button size="small" onClick={onRemove}>
          Delete
        </Button>
      }
    >
      <Box
        component="span"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        // touchAction: none lets dnd-kit handle touch drags on the grip
        // instead of the browser scrolling the page.
        sx={{ cursor: "grab", touchAction: "none", px: 1 }}
      >
        ☰
      </Box>
      <ListItemButton selected={selected} onClick={onSelect}>
        <ListItemText primary={song.url} />
      </ListItemButton>
    </ListItem>
  );
}

export default Playlist;
