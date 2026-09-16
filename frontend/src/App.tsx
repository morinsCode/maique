import { useState } from "react";
import { Button } from "@mui/material";
import GuestUI from "./components/GuestUI.tsx";
import DjUI from "./components/DjUI.tsx";
import Playlist from "./components/Playlist.tsx";
import YouTubePlayer from "./components/YouTubePlayer.tsx";
import SoundCloudPlayer from "./components/SoundCloudPlayer.tsx";
import type { TrackRequest } from "./components/types.ts";
import { extractYouTubeVideoId } from "./providers/youtube.ts";
/* import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg"; */
import "./App.css";

function App() {
  const [requests, setRequests] = useState<TrackRequest[]>([]);
  const [playlist, setPlaylist] = useState<TrackRequest[]>([]);
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
    <>
      <GuestUI
        onSubmit={(request) => setRequests((prev) => [...prev, request])}
      />
      <DjUI
        requests={requests}
        onApprove={handleApprove}
        onRemove={handleRemove}
      />
      <Playlist songs={playlist} />
      {!soundEnabled && (
        <Button variant="outlined" onClick={() => setSoundEnabled(true)}>
          Enable sound
        </Button>
      )}
      {currentSong?.service === "youtube" && (
        <YouTubePlayer
          videoId={extractYouTubeVideoId(currentSong.url) ?? ""}
          soundEnabled={soundEnabled}
          onEnded={handleEnded}
        />
      )}
      {currentSong?.service === "soundcloud" && (
        <SoundCloudPlayer
          url={currentSong.url}
          soundEnabled={soundEnabled}
          onEnded={handleEnded}
        />
      )}
    </>
  );
}

export default App;
