/**
 * Helpers for time + schedule matching.
 * Server is the source of truth for "now" — but we expose helpers the cron job uses.
 */

export const nowMinutes = (date = new Date()) => date.getHours() * 60 + date.getMinutes();

export const timeToMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== "string") return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

/**
 * Returns the next dose Date after `from` for a given schedule, or null.
 * Used by frontend for "Upcoming" widgets.
 */
export const nextDoseDate = (schedule, from = new Date()) => {
  const target = timeToMinutes(schedule.time);
  if (target === null) return null;

  const result = new Date(from);
  result.setHours(Math.floor(target / 60), target % 60, 0, 0);

  if (schedule.frequency === "daily") {
    if (result <= from) result.setDate(result.getDate() + 1);
    return result;
  }

  if (schedule.frequency === "weekly" || schedule.frequency === "custom") {
    const days = schedule.daysOfWeek || [];
    if (days.length === 0) return null;
    for (let i = 0; i < 8; i++) {
      const probe = new Date(result);
      probe.setDate(probe.getDate() + i);
      const inDays = days.includes(probe.getDay());
      const isToday = probe.toDateString() === from.toDateString();
      const isFuture = probe > from;
      if (inDays && (isFuture || (isToday && target > nowMinutes(from)))) {
        return probe;
      }
    }
  }
  return null;
};

/**
 * Returns all doses (Date) for a given date+schedule.
 * Used by the cron job to build today's plan.
 */
export const dosesForDate = (schedule, date) => {
  const target = timeToMinutes(schedule.time);
  if (target === null) return [];
  const d = new Date(date);
  d.setHours(Math.floor(target / 60), target % 60, 0, 0);
  if (schedule.frequency === "daily") return [d];
  if (schedule.daysOfWeek?.includes(d.getDay())) return [d];
  return [];
};

/**
 * 30-day adherence percentage for a medicine.
 */
export const adherencePct = (logs) => {
  if (!logs || logs.length === 0) return 0;
  const taken = logs.filter((l) => l.status === "taken").length;
  return Math.round((taken / logs.length) * 100);
};
