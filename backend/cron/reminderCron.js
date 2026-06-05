import cron from "node-cron";
import Medicine from "../models/Medicine.js";
import User from "../models/User.js";
import { sendReminderEmail } from "../services/emailService.js";
import { timeToMinutes, nowMinutes, dosesForDate } from "../utils/helpers.js";

/**
 * Runs every minute.
 * 1) Find all active medicines where any schedule matches "now" (HH:MM)
 * 2) For each, create a pending log if not already logged for that dose
 * 3) Send the email reminder
 */
const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentHHMM = `${hh}:${mm}`;
      const today = now.getDay();

      const medicines = await Medicine.find({
        active: true,
        reminderEmail: true,
        "schedules.time": currentHHMM,
      }).populate("user");

      if (medicines.length === 0) return;

      for (const med of medicines) {
        const schedule = med.schedules.find((s) => s.time === currentHHMM);
        if (!schedule) continue;
        if (
          (schedule.frequency === "weekly" || schedule.frequency === "custom") &&
          !schedule.daysOfWeek?.includes(today)
        )
          continue;

        const doses = dosesForDate(schedule, now);
        if (doses.length === 0) continue;
        const scheduledFor = doses[0];

        // Skip if a log already exists for this exact dose
        const existing = med.logs.find(
          (l) => new Date(l.scheduledFor).getTime() === scheduledFor.getTime()
        );
        if (existing && existing.status !== "pending") continue;

        if (!existing) {
          med.logs.push({ scheduledFor, status: "pending" });
          await med.save();
        }

        try {
          await sendReminderEmail({
            to: med.user.email,
            userName: med.user.name,
            medicine: med,
            schedule,
          });
          console.log(`📧 Reminder sent: ${med.name} → ${med.user.email}`);
        } catch (err) {
          console.error("❌ Email failed:", err.message);
        }
      }
    } catch (err) {
      console.error("❌ Cron error:", err.message);
    }
  });

  /**
   * Mark missed doses every 5 minutes.
   * A dose is "missed" if it was scheduled >30min ago and still pending.
   */
  cron.schedule("*/5 * * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000);
      const medicines = await Medicine.find({ active: true, "logs.status": "pending" });
      for (const med of medicines) {
        let changed = false;
        for (const log of med.logs) {
          if (log.status === "pending" && new Date(log.scheduledFor) < cutoff) {
            log.status = "missed";
            changed = true;
          }
        }
        if (changed) await med.save();
      }
    } catch (err) {
      console.error("❌ Missed-cron error:", err.message);
    }
  });

  console.log("⏰ Reminder cron started (every minute) + missed-dose cron (every 5 min)");
};

export default startReminderCron;
