import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_NODE_SIZE } from "./constants";

export default function useNodeSizeRegistry() {
  const [nodeSizes, setNodeSizes] = useState({});
  const resizeObserversRef = useRef({});

  const setNodeElement = useCallback((id, element) => {
    const previousObserver = resizeObserversRef.current[id];
    if (previousObserver) {
      previousObserver.disconnect();
      delete resizeObserversRef.current[id];
    }

    if (!element) return;

    const updateSize = () => {
      setNodeSizes((previous) => {
        const nextWidth = Math.round(element.offsetWidth || FALLBACK_NODE_SIZE.width);
        const nextHeight = Math.round(element.offsetHeight || FALLBACK_NODE_SIZE.height);
        const current = previous[id];

        if (current?.width === nextWidth && current?.height === nextHeight) {
          return previous;
        }

        return {
          ...previous,
          [id]: {
            width: nextWidth,
            height: nextHeight,
          },
        };
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    resizeObserversRef.current[id] = observer;
  }, []);

  useEffect(() => {
    const observers = resizeObserversRef.current;

    return () => {
      Object.values(observers).forEach((observer) => observer.disconnect());
    };
  }, []);

  return { nodeSizes, setNodeElement };
}
