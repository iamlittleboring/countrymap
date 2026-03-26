export default function OverviewTile({ title, subtitle, text }) {
  return (
    <article className="level-card">
      <p>{title}</p>
      <strong>{subtitle}</strong>
      <span>{text}</span>
    </article>
  );
}
