import useUi from "./useUi";

export default function MindMapHelpPanel() {
  const { copy } = useUi();

  return (
    <article className="panel">
      <header className="panel-header panel-header-compact">
        <div>
          <p className="eyebrow">{copy.explanationEyebrow}</p>
          <h2>{copy.howToReadArrows}</h2>
        </div>
      </header>
      <div className="mindmap-help">
        <p>{copy.helpTextOne}</p>
        <p>{copy.helpTextTwo}</p>
        <p>{copy.helpTextThree}</p>
      </div>
    </article>
  );
}
