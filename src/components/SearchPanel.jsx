import SearchSuggestions from "./SearchSuggestions";

export default function SearchPanel({
  searchId,
  query,
  setQuery,
  placeholder = "Пошук",
  searchControlsId,
  activeId,
  typeMeta,
  suggestions,
  onPick,
  note,
  statusMessage,
  extra,
}) {
  const hasQuery = query.trim().length > 0;

  return (
    <article className="panel panel-search">
      <div className="toolbar-stack">
        <label className="search-box" htmlFor={searchId}>
          <input
            id={searchId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-expanded={hasQuery ? "true" : "false"}
            aria-controls={searchControlsId}
            aria-describedby={note ? `${searchId}-note` : undefined}
          />
        </label>

        <div id={searchControlsId}>
          <SearchSuggestions
            query={query}
            suggestions={suggestions}
            activeId={activeId}
            typeMeta={typeMeta}
            onPick={onPick}
          />
        </div>

        {note && (
          <p className="screen-note" id={`${searchId}-note`}>
            {note}
          </p>
        )}

        {statusMessage && <p className="screen-note">{statusMessage}</p>}

        {extra}
      </div>
    </article>
  );
}
