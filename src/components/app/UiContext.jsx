import { UiContext } from "./uiContextValue";

export function UiProvider({ value, children }) {
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
