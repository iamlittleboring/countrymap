import useUi from "../app/useUi";
import IconButton from "./IconButton";

export default function MindMapToolbar({
  isFullscreen,
  graphNodeCount,
  visibleRelationCount,
  zoom,
  minusIcon,
  plusIcon,
  fitToScreenIcon,
  focusTargetIcon,
  onZoomOut,
  onZoomIn,
  onToggleFullscreen,
  onFocusActive,
}) {
  const { copy } = useUi();

  return (
    <header
      className={["panel-header", "mindmap-canvas-header", isFullscreen ? "mindmap-canvas-header-fullscreen" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <p className="eyebrow">{copy.mindMapEyebrow}</p>
        <h2>{copy.globalMindMap}</h2>
      </div>
      <div className="mindmap-stats">
        <span>{copy.nodeCountLabel(graphNodeCount)}</span>
        <span>{copy.relationCountLabel(visibleRelationCount)}</span>
        <span>{copy.zoomLabel(zoom)}</span>
      </div>
      <div className="mindmap-controls">
        <IconButton label={copy.zoomOut} icon={minusIcon} onClick={onZoomOut} />
        <IconButton label={copy.zoomIn} icon={plusIcon} onClick={onZoomIn} />
        <IconButton
          label={isFullscreen ? copy.exitFullscreen : copy.enterFullscreen}
          icon={fitToScreenIcon}
          onClick={onToggleFullscreen}
        />
        <IconButton label={copy.focusActiveNode} icon={focusTargetIcon} onClick={onFocusActive} />
      </div>
    </header>
  );
}
