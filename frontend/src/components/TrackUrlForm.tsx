import { Typography, TextField, Button } from "@mui/material";
import type { TrackRequest } from "../../../shared/types.ts";
import { useState } from "react";
import { detectService } from "../providers/detect";

type TrackUrlFormProps = {
  title: string;
  submitLabel: string;
  guest: string;
  onSubmit: (track: TrackRequest) => void;
};

// URL input that validates the provider and submits a TrackRequest; shared by the guest and DJ views.
function TrackUrlForm({ title, submitLabel, guest, onSubmit }: TrackUrlFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const service = detectService(url);
    if (!service) {
      setError("Enter a valid YouTube or SoundCloud URL");
      return;
    }
    setError(null);
    onSubmit({ guest, url, service });
    setUrl("");
  }

  return (
    <div>
      <Typography variant="h6">{title}</Typography>
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
        {submitLabel}
      </Button>
    </div>
  );
}

export default TrackUrlForm;
