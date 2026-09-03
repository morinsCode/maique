import { Typography, TextField, Button } from "@mui/material";
import type { Request } from "./types";
import { useState } from "react";

function GuestUI() {
  const [request, setRequest] = useState<Request>({
    guest: "moe",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
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
          value={request.url}
          /* onChange={(e) => setRequest({ ...request, url: e.target.value })} */
        />
        <Button variant="contained" color="primary">
          Submit
        </Button>
      </div>
    </>
  );
}

export default GuestUI;
