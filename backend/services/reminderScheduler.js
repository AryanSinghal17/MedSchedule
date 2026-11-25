const cron = require("node-cron");
const Medicine = require("../models/Medicine");
const User = require("../models/User");
const DoseRecord = require("../models/DoseRecord");
const sendEmail = require("./mailer");

const scheduleClock = require("./scheduleClock");

// Check the configured schedule every minute while this worker is running.
function startReminderScheduler() {
  return cron.schedule("* * * * *", async () => {
    try {
      // Old: now.toISOString().slice(0, 10) could use yesterday's UTC date.
      const { date, today, currentTime } = scheduleClock();

      console.log("Scheduler time:", today, currentTime);

      const dueMedicines = await Medicine.find({
        emailReminder: true,
        days: today,
        reminderTime: currentTime,
      });

      console.log(`Found ${dueMedicines.length} reminders due now.`);

      for (const medicine of dueMedicines) {
        try {
          await remindOne(medicine, date);
        } catch (error) {
          console.error("Reminder failed for medicine", medicine._id, error.message);
        }
      }
    } catch (error) {
      console.error("Reminder check failed:", error.message);
    }
  }, { noOverlap: true });
}

// Send one pending reminder and record when SMTP accepts it.
async function remindOne(medicine, date) {
  const user = await User.findById(medicine.userId);

  if (!user) {
    return;
  }

  const doseRecord = await DoseRecord.findOneAndUpdate(
    {
      userId: medicine.userId,
      medicineId: medicine._id,
      date,
    },
    {
      $setOnInsert: {
        status: "Pending",
        emailSentAt: null,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    },
  );

  // Old: if (doseRecord.emailSentAt) also allowed completed doses through.
  if (doseRecord.status !== "Pending" || doseRecord.emailSentAt) {
    return;
  }

  await sendEmail({
    to: user.email,
    subject: `Medicine reminder: ${medicine.name}`,
    text: `It is time to take ${medicine.name} (${medicine.dose}). Scheduled time: ${medicine.reminderTime}.`,
  });

  doseRecord.emailSentAt = new Date();
  await doseRecord.save();
}

module.exports = startReminderScheduler;
