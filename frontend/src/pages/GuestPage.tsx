import GuestUI from "../components/GuestUI.tsx";
import type { TrackRequest } from "../../../shared/types.ts";

type GuestPageProps = {
  onSubmit: (request: TrackRequest) => void;
};

function GuestPage({ onSubmit }: GuestPageProps) {
  return <GuestUI onSubmit={onSubmit} />;
}

export default GuestPage;
