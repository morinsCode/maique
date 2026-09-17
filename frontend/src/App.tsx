import { useState } from "react";
import { Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage.tsx";
import GuestPage from "./pages/GuestPage.tsx";
import DjPage from "./pages/DjPage.tsx";
import type { TrackRequest } from "./components/types.ts";
import { useSyncedState } from "./hooks/useSyncedState.ts";
import "./App.css";

function App() {
  const [requests, setRequests] = useSyncedState<TrackRequest[]>(
    "requests",
    [],
  );
  const [playlist, setPlaylist] = useSyncedState<TrackRequest[]>(
    "playlist",
    [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const currentSong = playlist[currentIndex];

  function handleApprove(index: number) {
    setPlaylist((prev) => [...prev, requests[index]]);
    setRequests((prev) => prev.filter((_, i) => i !== index));
  }

  function handleRemove(index: number) {
    setRequests((prev) => prev.filter((_, i) => i !== index));
  }

  function handleEnded() {
    setCurrentIndex((i) => (i + 1 < playlist.length ? i + 1 : i));
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/guest"
        element={
          <GuestPage
            onSubmit={(request) => setRequests((prev) => [...prev, request])}
          />
        }
      />
      <Route
        path="/dj"
        element={
          <DjPage
            requests={requests}
            playlist={playlist}
            currentSong={currentSong}
            soundEnabled={soundEnabled}
            onApprove={handleApprove}
            onRemove={handleRemove}
            onEnableSound={() => setSoundEnabled(true)}
            onEnded={handleEnded}
          />
        }
      />
    </Routes>
  );
}

export default App;
