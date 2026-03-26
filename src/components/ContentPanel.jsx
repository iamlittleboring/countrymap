export default function ContentPanel({ children, className = "panel panel-hero" }) {
  return <article className={className}>{children}</article>;
}
