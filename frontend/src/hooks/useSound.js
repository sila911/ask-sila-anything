import { useState, useEffect } from "react";
import { sounds } from "../utils/soundEffects";

export function useSound() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sound_muted") === "true";
    }
    return false;
  });

  useEffect(() => {
    const handleMuteChange = (e) => {
      setIsMuted(e.detail.isMuted);
    };
    window.addEventListener("sound-mute-change", handleMuteChange);
    return () => window.removeEventListener("sound-mute-change", handleMuteChange);
  }, []);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.setMuted(nextState);
    if (!nextState) {
      sounds.playPop(520);
    }
  };

  return {
    isMuted,
    toggleSound,
    playPop: (freq) => sounds.playPop(freq),
    playSparkle: () => sounds.playSparkle(),
    playSuccess: () => sounds.playSuccess(),
    playClick: () => sounds.playClick(),
  };
}
