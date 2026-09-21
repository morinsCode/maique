import { useState } from "react";
import { Routes, Route, useParams } from "react-router";
import LandingPage from "./pages/LandingPage.tsx";
import GuestPage from "./pages/GuestPage.tsx";
import DjPage from "./pages/DjPage.tsx";
import { useRoomState } from "./hooks/useRoomState.ts";
import "./App.css";

function DjRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const { requests, playlist, approve, reject } = useRoomState(roomId ?? "");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const currentSong = playlist[currentIndex];

  function handleEnded() {
    setCurrentIndex((i) => (i + 1 < playlist.length ? i + 1 : i));
  }

  return (
    <DjPage
      roomId={roomId ?? ""}
      requests={requests}
      playlist={playlist}
      currentSong={currentSong}
      soundEnabled={soundEnabled}
      onApprove={approve}
      onRemove={reject}
      onEnableSound={() => setSoundEnabled(true)}
      onEnded={handleEnded}
    />
  );
}

function GuestRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const { submitRequest } = useRoomState(roomId ?? "");
  return <GuestPage onSubmit={submitRequest} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/guest/:roomId" element={<GuestRoom />} />
      <Route path="/dj/:roomId" element={<DjRoom />} />
    </Routes>
  );
}

export default App;
