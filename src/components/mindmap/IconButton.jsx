export default function IconButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      className="ghost-button icon-button"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="icon-button-glyph" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
    </button>
  );
}
