import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
/* import "./index.css"; */

import GuestUI from "./components/GuestUI.tsx";
import DjUI from "./components/DjUI.tsx";
import Playlist from "./components/Playlist.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GuestUI />
    <DjUI />
    <Playlist />
  </StrictMode>,
);
