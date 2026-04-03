import useUi from "./app/useUi";

export default function SearchSuggestions({ query, suggestions, activeId, typeMeta, onPick }) {
  const { copy } = useUi();

  if (!query.trim()) return null;

  return (
    <div className="search-suggestions" role="listbox" aria-label={copy.searchResultsAria}>
      {suggestions.length ? (
        suggestions.map((node) => {
          const meta = typeMeta[node.type] || { label: node.type };

          return (
            <button
              key={node.id}
              type="button"
              className={[
                "search-suggestion-item",
                activeId === node.id ? "search-suggestion-item-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onPick(node)}
              role="option"
              aria-selected={activeId === node.id}
            >
              <span className="search-suggestion-topline">
                <strong>{node.title}</strong>
              </span>
              <span className="search-suggestion-meta">
                <span>{meta.label}</span>
                <span className="level-pill">{copy.levelLabel(node.level || 1)}</span>
              </span>
            </button>
          );
        })
      ) : (
        <div className="search-suggestion-empty">{copy.nothingFound}</div>
      )}
    </div>
  );
}
