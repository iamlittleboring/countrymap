import useUi from "./app/useUi";
import SearchSuggestions from "./SearchSuggestions";

export default function SearchPanel({
  searchId,
  query,
  setQuery,
  placeholder,
  searchControlsId,
  activeId,
  typeMeta,
  suggestions,
  onPick,
  note,
  statusMessage,
  extra,
}) {
  const { copy } = useUi();
  const hasQuery = Boolean(query.trim());
  const noteId = note ? `${searchId}-note` : undefined;

  return (
    <article className="panel panel-search">
      <div className="toolbar-stack">
        <label className="search-box" htmlFor={searchId}>
          <input
            id={searchId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder || copy.searchPlaceholder}
            aria-expanded={hasQuery}
            aria-controls={searchControlsId}
            aria-describedby={noteId}
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

        {note && <p className="screen-note" id={noteId}>{note}</p>}

        {statusMessage && <p className="screen-note">{statusMessage}</p>}

        {extra}
      </div>
    </article>
  );
}
