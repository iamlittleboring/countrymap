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
  return (
    <header
      className={["panel-header", "mindmap-canvas-header", isFullscreen ? "mindmap-canvas-header-fullscreen" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <p className="eyebrow">Мапа взаємодій</p>
        <h2>Глобальна мапа</h2>
      </div>
      <div className="mindmap-stats">
        <span>{graphNodeCount} вузлів</span>
        <span>{visibleRelationCount} зв&apos;язків</span>
        <span>Масштаб {Math.round(zoom * 100)}%</span>
      </div>
      <div className="mindmap-controls">
        <IconButton label="Зменшити масштаб" icon={minusIcon} onClick={onZoomOut} />
        <IconButton label="Збільшити масштаб" icon={plusIcon} onClick={onZoomIn} />
        <IconButton
          label={isFullscreen ? "Вийти з повноекранного режиму" : "Повноекранний режим"}
          icon={fitToScreenIcon}
          onClick={onToggleFullscreen}
        />
        <IconButton label="До активного вузла" icon={focusTargetIcon} onClick={onFocusActive} />
      </div>
    </header>
  );
}
