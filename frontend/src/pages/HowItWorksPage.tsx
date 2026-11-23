import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  ButtonBase,
  Container,
  Dialog,
  Stack,
  Typography,
} from "@mui/material";

// Video imports
import DjVideo from "../assets/howtomp4/Dj-View.mp4";
import GuestVideo from "../assets/howtomp4/Guest-View.mp4";

type Clip = { src: string; label: string };

const djClip: Clip = { src: DjVideo, label: "Create a room as a DJ" };
const guestClip: Clip = { src: GuestVideo, label: "Guest view for adding songs" };

function ClipPreview({
  clip,
  onOpen,
}: {
  clip: Clip;
  onOpen: (clip: Clip) => void;
}) {
  return (
    <ButtonBase
      onClick={() => onOpen(clip)}
      aria-label={`Watch: ${clip.label}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 1,
        width: "100%",
        cursor: "pointer",
      }}
    >
      <Box sx={{ position: "relative", width: "100%" }}>
        {/* #t=0.1 makes the browser show a still frame instead of a black box */}
        <Box
          component="video"
          src={`${clip.src}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          aria-hidden
          sx={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 72,
            height: 72,
            borderRadius: "50%",
            bgcolor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              ml: "6px",
              borderStyle: "solid",
              borderWidth: "14px 0 14px 24px",
              borderColor: "transparent transparent transparent #fff",
            }}
          />
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Click to watch
      </Typography>
    </ButtonBase>
  );
}

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [enlarged, setEnlarged] = useState<Clip | null>(null);

  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Typography variant="h1">How It Works</Typography>

        <Stack spacing={2}>
          <Typography variant="h2">What is MaiQue?</Typography>
          <Typography variant="body1">
            At my friend’s birthday party, we decided everyone should be able to
            add songs to the playlist. This lasted about twenty minutes. Songs
            got cut off mid-chorus, skipped before the first verse, and at one
            point three people were fighting over the same phone. You don’t want
            to be the dictator who bans guests from choosing music, but you also
            don’t want chaos on the dance floor.
          </Typography>
          <Typography variant="body1">
            So in the name of peace I built MaiQue. One person is the DJ and
            runs the playlist. Guests join with a room code and send requests
            from their own devices, without touching the DJ’s device. The DJ
            approves what fits, and it’s added to the queue.
          </Typography>
          <Typography variant="body1">
            You can also use MaiQue on your own, as a playlist that mixes tracks
            from different services: currently YouTube and SoundCloud.
          </Typography>
        </Stack>
        <Typography variant="h2">How it works</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h3">As the DJ</Typography>
            <Typography variant="body1">
              Create a room from the home page
            </Typography>
            <Typography variant="body1">
              Paste YouTube or SoundCloud links to build your playlist
            </Typography>
            <Typography variant="body1">
              Drag to reorder, and approve or remove guest requests
            </Typography>
            <ClipPreview clip={djClip} onOpen={setEnlarged} />
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h3">As a guest</Typography>
            <Typography variant="body1">
              Get the room code from the DJ
            </Typography>
            <Typography variant="body1">
              Enter it on the home page under “Request track”
            </Typography>
            <Typography variant="body1">
              Paste a YouTube or SoundCloud link to send a request
            </Typography>
            <ClipPreview clip={guestClip} onOpen={setEnlarged} />
          </Stack>
        </Box>

        <Button variant="contained" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </Stack>

      <Dialog
        open={enlarged !== null}
        onClose={() => setEnlarged(null)}
        maxWidth="xl"
      >
        {enlarged && (
          <Box
            component="video"
            src={enlarged.src}
            aria-label={enlarged.label}
            controls
            autoPlay
            playsInline
            sx={{ display: "block", width: "100%", height: "auto" }}
          />
        )}
      </Dialog>
    </Container>
  );
}
