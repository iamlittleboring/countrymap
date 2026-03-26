export default function PracticalNodesPanel({ allNodes, onSelect }) {
  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Швидкий доступ</p>
          <h2>Практичні вузли</h2>
        </div>
      </header>

      <div className="practical-grid">
        {allNodes
          .filter((node) => (node.level || 1) === 4)
          .slice(0, 6)
          .map((node) => (
            <button
              key={node.id}
              type="button"
              className="practical-card"
              onClick={() => onSelect(node.id)}
            >
              <strong>{node.title}</strong>
              <span>{node.description}</span>
            </button>
          ))}
      </div>
    </article>
  );
}
