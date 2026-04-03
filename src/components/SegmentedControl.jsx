export default function SegmentedControl({ label, ariaLabel, options, value, getOptionLabel, onChange }) {
  return (
    <div className="header-control">
      <span className="header-control-label">{label}</span>
      <div className="view-switch" aria-label={ariaLabel}>
        {options.map((option) => {
          const isActive = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              className={isActive ? "view-tab active" : "view-tab"}
              onClick={() => onChange(option.id)}
              aria-pressed={isActive}
            >
              {getOptionLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
