import { Typography, Button } from "@mui/material";
import type { TrackRequest } from "../../../shared/types.ts";

type GuestRequestsProps = {
  requests: TrackRequest[];
  onApprove: (index: number) => void;
  onRemove: (index: number) => void;
};

function GuestRequests({ requests, onApprove, onRemove }: GuestRequestsProps) {
  return (
    <div>
      <Typography variant="h6">Guest Requests</Typography>
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

export default GuestRequests;
