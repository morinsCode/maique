import { Typography, TextField, Button } from "@mui/material";
import type { TrackRequest } from "./types";
import { useState } from "react";
import { detectService } from "../providers/detect";

type GuestUIProps = {
  onSubmit: (request: TrackRequest) => void;
};

function GuestUI({ onSubmit }: GuestUIProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const service = detectService(url);
    if (!service) {
      setError("Enter a valid YouTube or SoundCloud URL");
      return;
    }
    setError(null);
    onSubmit({ guest: "moe", url, service });
    setUrl("");
  }

  return (
    <>
      <div>
        <Typography variant="h6">Guest UI</Typography>
        <TextField
          label="Paste YouTube or SoundCloud URL"
          variant="outlined"
          fullWidth
          margin="normal"
          value={url}
          error={Boolean(error)}
          helperText={error}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </>
  );
}

export default GuestUI;
