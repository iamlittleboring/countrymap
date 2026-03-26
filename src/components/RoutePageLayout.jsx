export default function RoutePageLayout({ header, top, tiles, children, className = "" }) {
  return (
    <div className="app-shell">
      <div className="app-background" />
      <main className="app-layout">
        {header}
        {top}
        {className ? <section className={className}>{tiles}{children}</section> : <>{tiles}{children}</>}
      </main>
    </div>
  );
}
