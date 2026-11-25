// Read all schedule fields in one timezone, including around local midnight.
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: process.env.SCHEDULE_TIMEZONE || "Asia/Kolkata",
  weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

module.exports = function scheduleClock(now = new Date()) {
  const parts = Object.fromEntries(clock.formatToParts(now).map(p => [p.type, p.value]));
  return {
    date: [parts.year, parts.month, parts.day].join("-"),
    today: parts.weekday,
    currentTime: [parts.hour, parts.minute].join(":"),
  };
};
