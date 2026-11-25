// Old: const API_URL = "http://localhost:3040" in each component.
// Vite reads this public address at build time. An empty address uses the same origin.
// Vercel must call the Render API. VITE_API_URL can override this per environment.
export const API_URL = (import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3040"
    : "")).replace(/\/$/, "");

export const SCHEDULE_TIMEZONE = import.meta.env.VITE_SCHEDULE_TIMEZONE || "Asia/Kolkata";

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000),
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    if (error.name === "TimeoutError") throw new Error("The server took too long to respond. Please try again.", { cause: error });
    throw new Error("Could not reach the server. Please try again.", { cause: error });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function scheduleDate(timeZone, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
