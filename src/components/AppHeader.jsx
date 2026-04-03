import { APP_TABS } from "../lib/appTabs";
import { LANGUAGE_OPTIONS, THEME_OPTIONS } from "../lib/uiCopy";
import SegmentedControl from "./SegmentedControl";
import useUi from "./app/useUi";

export default function AppHeader({ screen, onScreenChange }) {
  const { theme, setTheme, language, setLanguage, copy } = useUi();
  const tabLabels = {
    list: copy.listTab,
    mindmap: copy.mindMapTab,
  };
  const themeLabels = {
    light: copy.lightTheme,
    dark: copy.darkTheme,
  };

  return (
    <header className="app-topbar">
      <div>
        <p className="eyebrow">{copy.navEyebrow}</p>
        <h2>{copy.appTitle}</h2>
      </div>

      <div className="header-controls">
        <SegmentedControl
          label={copy.pageSwitchLabel}
          ariaLabel={copy.pageSwitchAria}
          options={APP_TABS}
          value={screen}
          getOptionLabel={(option) => tabLabels[option.id]}
          onChange={onScreenChange}
        />
        <SegmentedControl
          label={copy.themeSwitchLabel}
          ariaLabel={copy.themeSwitchLabel}
          options={THEME_OPTIONS}
          value={theme}
          getOptionLabel={(option) => themeLabels[option.id]}
          onChange={setTheme}
        />
        <SegmentedControl
          label={copy.languageSwitchLabel}
          ariaLabel={copy.languageSwitchLabel}
          options={LANGUAGE_OPTIONS}
          value={language}
          getOptionLabel={(option) => option.shortLabel}
          onChange={setLanguage}
        />
      </div>
    </header>
  );
}
