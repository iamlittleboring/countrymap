export default function RoutePageLayout({ header, top, tiles, children, panelId, tabId, className = "" }) {
  const contentClassName = className ? className : undefined;

  return (
    <div className="app-shell">
      <div className="app-background" />
      <main className="app-layout">
        {header}
        {top}
        <div className={contentClassName} role="tabpanel" id={panelId} aria-labelledby={tabId}>
          {tiles}
          {children}
        </div>
      </main>
    </div>
  );
}
