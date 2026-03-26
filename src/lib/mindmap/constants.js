export const FALLBACK_NODE_SIZE = {
  width: 220,
  height: 140,
};

export const VIEWPORT_PADDING = 80;
export const MIN_ZOOM = 0.45;
export const MAX_ZOOM = 1.9;
export const NODE_DRAG_THRESHOLD = 6;

export const INITIAL_PAN = { x: 0, y: 0 };
export const INITIAL_VIEWPORT = { width: 0, height: 0 };

export const INITIAL_DRAG = {
  dragging: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  startPanX: 0,
  startPanY: 0,
};

export const INITIAL_NODE_DRAG = {
  dragging: false,
  pointerId: null,
  nodeId: null,
  startX: 0,
  startY: 0,
  startNodeX: 0,
  startNodeY: 0,
  moved: false,
};
