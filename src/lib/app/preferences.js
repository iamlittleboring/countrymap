export const STORAGE_KEYS = {
  theme: "countrymap-theme",
  language: "countrymap-language",
};

export function readPreference(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function persistPreference(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors and keep the UI responsive.
  }
}
