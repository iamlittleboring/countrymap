import { useContext } from "react";
import { UiContext } from "./uiContextValue";

export default function useUi() {
  const context = useContext(UiContext);

  if (!context) {
    throw new Error("useUi must be used within UiProvider");
  }

  return context;
}
