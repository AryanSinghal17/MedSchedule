// Old: const API_URL = "http://localhost:3040" in each component.
// Vite reads this public address at build time. An empty address uses the same origin.
export const API_URL = (import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:3040" : "")).replace(/\/$/, "");
