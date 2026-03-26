import ContentPanel from "./ContentPanel";
import SearchPanel from "./SearchPanel";

export default function HeroSearchPanel({
  className = "hero-grid",
  content,
  search,
}) {
  return (
    <section className={className}>
      <ContentPanel>{content}</ContentPanel>
      <SearchPanel {...search} />
    </section>
  );
}
