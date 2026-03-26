import { useEffect, useState } from "react";
import { INITIAL_VIEWPORT } from "./constants";
import { getViewportSize } from "./resourceUtils";

export default function useViewportSize(viewportRef) {
  const [viewportSize, setViewportSize] = useState(INITIAL_VIEWPORT);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const observer = new ResizeObserver(() => setViewportSize(getViewportSize(viewport)));
    observer.observe(viewport);
    setViewportSize(getViewportSize(viewport));

    return () => observer.disconnect();
  }, [viewportRef]);

  return [viewportSize, setViewportSize];
}
