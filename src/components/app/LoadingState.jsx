export default function LoadingState({ title, description }) {
  return (
    <section className="panel loading-panel">
      <p className="eyebrow">Проєкт</p>
      <h1>{title}</h1>
      <p className="hero-text">{description}</p>
    </section>
  );
}
