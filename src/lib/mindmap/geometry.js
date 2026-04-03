import { FALLBACK_NODE_SIZE, VIEWPORT_PADDING } from "./constants";

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getNodeCenter(position, size = FALLBACK_NODE_SIZE) {
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height / 2,
  };
}

export function getEdgePoint(center, target, size = FALLBACK_NODE_SIZE) {
  const dx = target.x - center.x;
  const dy = target.y - center.y;

  if (dx === 0 && dy === 0) return center;

  const halfWidth = size.width / 2;
  const halfHeight = size.height / 2;
  const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx);
  const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

export function getLinePoints(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const c1x = from.x + dx * 0.25;
  const c1y = from.y + dy * 0.25;
  const c2x = from.x + dx * 0.75;
  const c2y = to.y - dy * 0.25;

  return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
}

export function getPerpendicularOffset(from, to, offset = 0) {
  if (!offset) {
    return { x: 0, y: 0 };
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  if (!length) {
    return { x: 0, y: 0 };
  }

  return {
    x: (-dy / length) * offset,
    y: (dx / length) * offset,
  };
}

export function getOffsetLinePoints(from, to, offset = 0) {
  if (!offset) {
    return getLinePoints(from, to);
  }

  const { x: offsetX, y: offsetY } = getPerpendicularOffset(from, to, offset);

  return getLinePoints(
    {
      x: from.x + offsetX,
      y: from.y + offsetY,
    },
    {
      x: to.x + offsetX,
      y: to.y + offsetY,
    },
  );
}

export function getContentBounds(graphNodes, nodeSizes) {
  if (!graphNodes.length) {
    return { minX: 0, minY: 0, maxX: FALLBACK_NODE_SIZE.width, maxY: FALLBACK_NODE_SIZE.height };
  }

  return graphNodes.reduce(
    (bounds, { id, position }) => {
      const size = nodeSizes[id] || FALLBACK_NODE_SIZE;

      return {
        minX: Math.min(bounds.minX, position.x),
        minY: Math.min(bounds.minY, position.y),
        maxX: Math.max(bounds.maxX, position.x + size.width),
        maxY: Math.max(bounds.maxY, position.y + size.height),
      };
    },
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );
}

export function getPanBounds(viewportWidth, viewportHeight, bounds, zoom) {
  const scaledWidth = (bounds.maxX - bounds.minX) * zoom;
  const scaledHeight = (bounds.maxY - bounds.minY) * zoom;
  const widthFits = scaledWidth + VIEWPORT_PADDING * 2 <= viewportWidth;
  const heightFits = scaledHeight + VIEWPORT_PADDING * 2 <= viewportHeight;

  return {
    minX: widthFits
      ? (viewportWidth - scaledWidth) / 2 - bounds.minX * zoom
      : viewportWidth - bounds.maxX * zoom - VIEWPORT_PADDING,
    maxX: widthFits
      ? (viewportWidth - scaledWidth) / 2 - bounds.minX * zoom
      : VIEWPORT_PADDING - bounds.minX * zoom,
    minY: heightFits
      ? (viewportHeight - scaledHeight) / 2 - bounds.minY * zoom
      : viewportHeight - bounds.maxY * zoom - VIEWPORT_PADDING,
    maxY: heightFits
      ? (viewportHeight - scaledHeight) / 2 - bounds.minY * zoom
      : VIEWPORT_PADDING - bounds.minY * zoom,
  };
}

export function clampPan(pan, viewportWidth, viewportHeight, bounds, zoom) {
  const limits = getPanBounds(viewportWidth, viewportHeight, bounds, zoom);

  return {
    x: clamp(pan.x, limits.minX, limits.maxX),
    y: clamp(pan.y, limits.minY, limits.maxY),
  };
}
