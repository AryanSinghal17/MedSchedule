const express = require("express");
const { createHash, randomUUID, timingSafeEqual } = require("node:crypto");
const Medicine = require("../models/Medicine");
const DoseRecord = require("../models/DoseRecord");
const scheduleClock = require("../services/scheduleClock");

const router = express.Router();
const minute = 60_000;
const digest = value => createHash("sha256").update(value).digest();

// Only the private Google timer can request a recipient and reminder.
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  const secret = process.env.REMINDER_WORKER_SECRET;
  if (!secret || secret.length < 32) return res.sendStatus(503);
  if (!timingSafeEqual(digest(req.get("Authorization") || ""), digest("Bearer " + secret))) {
    return res.sendStatus(401);
  }
  next();
});

// Check recent schedule minutes so a cold start or a missed tick can catch up.
async function claimReminder(now) {
  const slots = [];
  for (let offset = 14; offset >= 0; offset--) {
    const instant = new Date(now.getTime() - offset * minute);
    slots.push({ ...scheduleClock(instant), until: new Date(Math.floor(+instant / minute) * minute + minute) });
  }
  const medicines = await Medicine.find({
    emailReminder: true,
    $or: slots.map(slot => ({ days: slot.today, reminderTime: slot.currentTime })),
  }).populate("userId", "email").lean();

  for (const medicine of medicines) {
    if (!medicine.userId?.email) continue;
    const slot = slots.find(s => s.currentTime === medicine.reminderTime && medicine.days.includes(s.today));
    if (!slot || medicine.updatedAt >= slot.until) continue;
    const key = { userId: medicine.userId._id, medicineId: medicine._id, date: slot.date };
    const token = randomUUID();
    try {
      // The unique daily-dose index prevents competing workers from claiming the same dose.
      const record = await DoseRecord.findOneAndUpdate({
        ...key, status: "Pending", emailSentAt: null,
        $or: [{ emailLeaseUntil: null }, { emailLeaseUntil: { $lte: now } }],
      }, {
        $set: { emailLeaseToken: token, emailLeaseUntil: new Date(+now + 4 * minute) },
        $setOnInsert: { ...key, status: "Pending" },
      }, { upsert: true, returnDocument: "after" });
      return {
        id: record.id, token, to: medicine.userId.email,
        subject: "Medicine reminder: " + medicine.name,
        body: "Your scheduled reminder for " + medicine.name + " (" + medicine.dose + ") at " + medicine.reminderTime + ".",
      };
    } catch (error) {
      // An existing sent, completed, or leased dose cannot be inserted again.
      if (error.code !== 11000) throw error;
    }
  }
  return null;
}

router.post("/claim", async (req, res) => {
  const reminder = await claimReminder(new Date());
  return reminder ? res.json(reminder) : res.sendStatus(204);
});

router.post("/sent", async (req, res) => {
  const { id, token } = req.body || {};
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id) || typeof token !== "string") {
    return res.sendStatus(400);
  }
  const filter = { _id: id, emailLeaseToken: token };
  const result = await DoseRecord.updateOne({ ...filter, emailSentAt: null }, {
    $set: { emailSentAt: new Date() }, $unset: { emailLeaseUntil: 1 },
  });
  // A repeated acknowledgement is safe if the first HTTP response was lost.
  if (result.matchedCount || await DoseRecord.exists({ ...filter, emailSentAt: { $ne: null } })) {
    return res.sendStatus(204);
  }
  return res.sendStatus(409);
});

module.exports = router;
