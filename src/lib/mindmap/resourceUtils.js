export function formatVerifyLabel(url, index) {
  try {
    const { hostname } = new URL(url);
    return `Перевірити: ${hostname.replace(/^www\./, "")}`;
  } catch {
    return `Перевірити джерело ${index + 1}`;
  }
}

export function getViewportSize(viewport) {
  return {
    width: viewport.clientWidth,
    height: viewport.clientHeight,
  };
}
