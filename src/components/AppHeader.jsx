import { APP_TABS } from "../lib/appTabs";

export default function AppHeader({ screen, onScreenChange }) {
  return (
    <header className="app-topbar">
      <div>
        <p className="eyebrow">Навігація</p>
        <h2>Карта країни</h2>
      </div>
      <div className="view-switch" aria-label="Екрани застосунку">
        {APP_TABS.map((tab) => {
          const isActive = screen === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={isActive ? "view-tab active" : "view-tab"}
              onClick={() => onScreenChange(tab.id)}
              aria-pressed={isActive}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
