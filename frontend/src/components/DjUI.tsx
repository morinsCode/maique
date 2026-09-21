import { Typography, Button } from "@mui/material";
import type { TrackRequest } from "../../../shared/types.ts";

type DjUIProps = {
  requests: TrackRequest[];
  onApprove: (index: number) => void;
  onRemove: (index: number) => void;
};

function DjUI({ requests, onApprove, onRemove }: DjUIProps) {
  return (
    <div>
      <Typography variant="h6">DJ UI</Typography>
      <Typography variant="body1">Guest Requests</Typography>
      <ul>
        {requests.map((request, index) => (
          <li key={index}>
            {request.url}
            <Button size="small" onClick={() => onApprove(index)}>
              Approve
            </Button>
            <Button size="small" onClick={() => onRemove(index)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DjUI;
