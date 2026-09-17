import GuestUI from "../components/GuestUI.tsx";
import type { TrackRequest } from "../components/types.ts";

type GuestPageProps = {
  onSubmit: (request: TrackRequest) => void;
};

function GuestPage({ onSubmit }: GuestPageProps) {
  return <GuestUI onSubmit={onSubmit} />;
}

export default GuestPage;
