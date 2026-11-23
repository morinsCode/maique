import { Container } from "@mui/material";

import GuestUI from "../components/GuestUI.tsx";
import type { TrackRequest } from "../../../shared/types.ts";

type GuestPageProps = {
  onSubmit: (request: TrackRequest) => void;
};

function GuestPage({ onSubmit }: GuestPageProps) {
  return (
    <Container>
      <GuestUI onSubmit={onSubmit} />
    </Container>
  );
}

export default GuestPage;
