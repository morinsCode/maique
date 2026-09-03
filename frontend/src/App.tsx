import { useState } from "react";
import GuestUI from "./components/GuestUI.tsx";
import DjUI from "./components/DjUI.tsx";
import Playlist from "./components/Playlist.tsx";
import YouTubePlayer from "./components/YouTubePlayer.tsx";
import type { TrackRequest } from "./components/types.ts";
import { extractYouTubeVideoId } from "./providers/youtube.ts";
/* import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg"; */
import "./App.css";

function App() {
  const [requests, setRequests] = useState<TrackRequest[]>([]);
  const [playlist, setPlaylist] = useState<TrackRequest[]>([]);

  function handleApprove(index: number) {
    setPlaylist((prev) => [...prev, requests[index]]);
    setRequests((prev) => prev.filter((_, i) => i !== index));
  }

  function handleRemove(index: number) {
    setRequests((prev) => prev.filter((_, i) => i !== index));
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
      {playlist.length > 0 && (
        <YouTubePlayer
          videoId={
            extractYouTubeVideoId(playlist[playlist.length - 1].url) ?? ""
          }
        />
      )}
    </>
  );
}

export default App;
