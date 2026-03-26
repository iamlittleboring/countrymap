export default function SearchSuggestions({ query, suggestions, activeId, typeMeta, onPick }) {
  if (!query.trim()) return null;

  return (
    <div className="search-suggestions" role="listbox" aria-label="Результати пошуку">
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
                <span className="level-pill">Рівень {node.level || 1}</span>
              </span>
            </button>
          );
        })
      ) : (
        <div className="search-suggestion-empty">Нічого не знайдено.</div>
      )}
    </div>
  );
}
