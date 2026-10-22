import type { TrackRequest } from "../../../shared/types.ts";
import TrackUrlForm from "./TrackUrlForm.tsx";

type GuestUIProps = {
  onSubmit: (request: TrackRequest) => void;
};

function GuestUI({ onSubmit }: GuestUIProps) {
  return (
    <TrackUrlForm
      title="Guest UI"
      submitLabel="Submit"
      guest="moe"
      onSubmit={onSubmit}
    />
  );
}

export default GuestUI;
