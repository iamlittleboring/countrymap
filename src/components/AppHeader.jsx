export default function AppHeader({ screen, onScreenChange }) {
  return (
    <header className="app-topbar">
      <div>
        <p className="eyebrow">Навігація</p>
        <h2>Карта країни</h2>
      </div>
      <div className="view-switch" role="tablist" aria-label="Екрани застосунку">
        <button
          type="button"
          className={screen === "list" ? "view-tab active" : "view-tab"}
          onClick={() => onScreenChange("list")}
          role="tab"
          aria-selected={screen === "list"}
          aria-controls="list-panel"
          id="list-tab"
          tabIndex={screen === "list" ? 0 : -1}
        >
          Список
        </button>
        <button
          type="button"
          className={screen === "mindmap" ? "view-tab active" : "view-tab"}
          onClick={() => onScreenChange("mindmap")}
          role="tab"
          aria-selected={screen === "mindmap"}
          aria-controls="mindmap-panel"
          id="mindmap-tab"
          tabIndex={screen === "mindmap" ? 0 : -1}
        >
          Мапа
        </button>
      </div>
    </header>
  );
}
