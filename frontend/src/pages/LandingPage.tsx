import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, Stack, TextField } from "@mui/material";

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

function LandingPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");

  function startAsDj() {
    navigate(`/dj/${generateRoomId()}`);
  }

  function joinAsGuest() {
    const roomId = joinCode.trim();
    if (roomId) navigate(`/guest/${roomId}`);
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 320, margin: "0 auto", padding: 4 }}>
      <Button variant="contained" onClick={startAsDj}>
        Start a room as DJ
      </Button>
      <TextField
        label="Room code"
        helperText="Ask the DJ for the room code, then enter it here to join"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
      />
      <Button
        variant="outlined"
        onClick={joinAsGuest}
        disabled={!joinCode.trim()}
      >
        Join as guest
      </Button>
    </Stack>
  );
}

export default LandingPage;
