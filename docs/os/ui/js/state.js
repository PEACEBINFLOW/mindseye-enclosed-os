export function routeKeyFromHash() {
  const raw = (location.hash || "#/HOME").trim();
  const key = raw.startsWith("#/") ? raw.slice(2) : "HOME";
  return (key || "HOME").toUpperCase();
}

export function setHash(key) {
  location.hash = `#/${String(key).toUpperCase()}`;
}
