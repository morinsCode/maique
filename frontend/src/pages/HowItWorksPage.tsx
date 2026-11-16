import { useNavigate } from "react-router";
import { Box, Button, Stack, Typography } from "@mui/material";

// Image imports
import GifCreateRoom from "../assets/howtogif/create-room.gif";
import GifAddSong from "../assets/howtogif/add-song.gif";
import GifRearrangePlaylist from "../assets/howtogif/rearrange-playlist.gif";
import GifCopyRoomCode from "../assets/howtogif/copy-room-code.gif";
import GifGuestRequests from "../assets/howtogif/guest-requests.gif";
import GifApproveRequest from "../assets/howtogif/dj-approves.gif";

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        How It Works
      </Typography>
      <Stack spacing={2}>
        <Typography>What is Maique?</Typography>
        <Typography>
          Maique is a platform that allows you to create multiservice playlists
          and enjoy collaborative music experiences. The DJ manages the room and
          plays tracks, while guests can request tracks and participate in the
          music experience. Intended for events such as parties, gatherings, and
          social events.
        </Typography>
        <Typography>How it works</Typography>
        <Typography>To get started, create a room as a DJ.</Typography>
        <Box
          component="img"
          src={GifCreateRoom}
          alt="Create a room as a DJ"
          sx={{
            width: "100%",
            maxWidth: 600,
            height: "auto",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        />
        <Typography>Add songs with YouTube or SoundCloud URL</Typography>
        <Box
          component="img"
          src={GifAddSong}
          alt="Add songs with YouTube or SoundCloud URL"
          sx={{
            width: "100%",
            maxWidth: 600,
            height: "auto",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        />
        <Typography>Rearrange the playlist as needed</Typography>
        <Box
          component="img"
          src={GifRearrangePlaylist}
          alt="Rearrange the playlist as needed"
          sx={{
            width: "100%",
            maxWidth: 600,
            height: "auto",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        />
        <Typography>Copy and share the room code with guests</Typography>
        <Box
          component="img"
          src={GifCopyRoomCode}
          alt="Copy and share the room code with guests"
          sx={{
            width: "100%",
            maxWidth: 600,
            height: "auto",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        />
        <Typography>
          Guest enters code on home page to access guest page.Guest enters URL
          of the track they want to request
        </Typography>
        <Box
          component="img"
          src={GifGuestRequests}
          alt="Guest enters URL of the track they want to request"
          sx={{
            width: "100%",
            maxWidth: 600,
            height: "auto",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        />

        <Typography>
          DJ reviews and approves the requested track, which are added to the
          playlist
        </Typography>
        <Box
          component="img"
          src={GifApproveRequest}
          alt="DJ reviews and approves the requested track"
          sx={{
            width: "100%",
            maxWidth: 600,
            height: "auto",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        />

        <Button variant="contained" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </Stack>
    </Box>
  );
}
