import { useCallback, useEffect, useState } from "react";
import { getViewportSize } from "./resourceUtils";

export default function useFullscreenState({ fullscreenRef, viewportRef, fitGraph, setViewportSize }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreenState = () => {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      const nextIsFullscreen = fullscreenElement === fullscreenRef.current;
      setIsFullscreen(nextIsFullscreen);

      requestAnimationFrame(() => {
        const viewport = viewportRef.current;
        if (viewport) {
          setViewportSize(getViewportSize(viewport));
        }

        if (nextIsFullscreen) {
          fitGraph();
        }
      });
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("webkitfullscreenchange", syncFullscreenState);
    };
  }, [fitGraph, fullscreenRef, setViewportSize, viewportRef]);

  const toggleFullscreen = useCallback(async () => {
    const element = fullscreenRef.current;
    if (!element) return;

    try {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

      if (fullscreenElement === element) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen", error);
    }
  }, [fullscreenRef]);

  return { isFullscreen, toggleFullscreen };
}
