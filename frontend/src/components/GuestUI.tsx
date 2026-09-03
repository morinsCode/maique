import { Typography, TextField, Button } from "@mui/material";
import type { TrackRequest } from "./types";
import { useState } from "react";

type GuestUIProps = {
  onSubmit: (request: TrackRequest) => void;
};

function GuestUI({ onSubmit }: GuestUIProps) {
  const [guestTrackRequest, setGuestTrackRequest] = useState<TrackRequest>({
    guest: "moe",
    url: "",
    service: "youtube",
  });

  return (
    <>
      <div>
        <Typography variant="h6">Guest UI</Typography>
        <TextField
          label="Paste song URL"
          variant="outlined"
          fullWidth
          margin="normal"
          value={guestTrackRequest.url}
          onChange={(e) =>
            setGuestTrackRequest({ ...guestTrackRequest, url: e.target.value })
          }
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSubmit(guestTrackRequest)}
        >
          Submit
        </Button>
      </div>
    </>
  );
}

export default GuestUI;
