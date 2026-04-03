import useUi from "./useUi";

export default function LoadingState({ title, description }) {
  const { copy } = useUi();

  return (
    <section className="panel loading-panel">
      <p className="eyebrow">{copy.projectEyebrow}</p>
      <h1>{title}</h1>
      <p className="hero-text">{description}</p>
    </section>
  );
}
