export function formatVerifyLabel(url, index, copy = {}) {
  try {
    const { hostname } = new URL(url);
    return `${copy.verifyPrefix || "Verify:"} ${hostname.replace(/^www\./, "")}`;
  } catch {
    return `${copy.verifyFallback || "Verify source"} ${index + 1}`;
  }
}

export function getViewportSize(viewport) {
  return {
    width: viewport.clientWidth,
    height: viewport.clientHeight,
  };
}
