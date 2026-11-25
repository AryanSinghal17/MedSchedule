const express = require("express");
const router = express.Router();

const Medicine = require("../models/Medicine");
const requireAuth = require("../middleware/requireAuth");
const DoseRecord = require("../models/DoseRecord");

const scheduleClock = require("../services/scheduleClock");

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Validate supplied fields before Mongoose can cast their values.
function validateMedicine(body, partial = false) {
  const fields = ["name", "dose", "reminderTime", "days", "emailReminder"];
  if (!body || !fields.some(key => Object.hasOwn(body, key))) return "Enter medicine details.";
  for (const key of ["name", "dose"]) {
    if ((!partial || key in body) && (typeof body[key] !== "string" || !body[key].trim())) {
      return "Enter a medicine name and prescribed dose.";
    }
  }
  if ((!partial || "reminderTime" in body) &&
      (typeof body.reminderTime !== "string" || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(body.reminderTime))) {
    return "Use a 24-hour reminder time, such as 09:30.";
  }
  if ((!partial || "days" in body) && (!Array.isArray(body.days) ||
      !body.days.length || !body.days.every(day => weekdays.includes(day)))) {
    return "Choose at least one valid weekday.";
  }
  if ("emailReminder" in body && typeof body.emailReminder !== "boolean") {
    return "Email reminder must be true or false.";
  }
}

// Read today's dose records once and attach their statuses to the user's medicines.
router.get("/", requireAuth, async (req, res) => {
  try {
    console.log(req)
    const medicines = await Medicine.find({
      userId: req.session.userId,
    }).sort({ reminderTime: 1 }).lean();
    const { date, today } = scheduleClock();
    const doses = await DoseRecord.find({ userId: req.session.userId, date }).lean();
    const statuses = new Map(doses.map(dose => [String(dose.medicineId), dose.status]));

    // Old: return res.json({ medicines }); omitted the separate dose records.
    return res.json({ medicines: medicines.map(medicine => ({
      ...medicine, doseDate: date, scheduledToday: medicine.days.includes(today),
      status: statuses.get(String(medicine._id)) || "Pending",
    })) });
  } catch (error) {
    return res.status(500).json({
      message: "Could not load medicines.",
    });
  }
});

// Create a schedule owned by the signed-in account.
router.post("/", requireAuth, async (req, res) => {
  try {
    const message = validateMedicine(req.body);
    if (message) return res.status(400).json({ message });
    const { name, dose, reminderTime, days, emailReminder } = req.body;

    const medicine = await Medicine.create({
      userId: req.session.userId,
      name: name.trim(),
      dose: dose.trim(),
      reminderTime,
      days,
      // Old: Boolean(emailReminder) treated the text "false" as true.
      emailReminder: emailReminder ?? true,
    });

    return res.status(201).json({ medicine });
  } catch (error) {
    return res.status(500).json({
      message: "Could not create medicine.",
    });
  }
});

// Update supplied schedule fields for this owner.
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const message = validateMedicine(req.body, true);
    if (message) return res.status(400).json({ message });
    const id = req.params.id;
    const { name, dose, reminderTime, days, emailReminder } = req.body;
    const data = await Medicine.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      { name, dose, reminderTime, days, emailReminder },
     { returnDocument: "after", runValidators: true }
    );
    if (!data) {
      return res.status(404).json({ message: "Medicine not found." });
    }
    return res.status(200).json({ medicine: data });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update medicine.",
    });
  }
});

// Delete one schedule after matching its owner and ID.
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!deletedMedicine) {
      return res.status(404).json({
        message: "Medicine not found.",
      });
    }

    return res.status(200).json({
      message: "Medicine deleted.",
      medicineId: deletedMedicine._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not delete medicine.",
    });
  }
});


// Parse a schedule date independently of the server's timezone.
function doseWeekday(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(date + "T00:00:00Z");
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null;
  return weekdays[(parsed.getUTCDay() + 6) % 7];
}

// Create or update one daily dose record for this medicine.
router.put("/:id/doses/:date", requireAuth, async (req, res) => {
  try {
    const { id, date } = req.params;
    const { status } = req.body;

    const weekday = doseWeekday(date);
    if (!weekday) {
      return res.status(400).json({ message: "Enter a real calendar date in YYYY-MM-DD format." });
    }

    if (!["Taken", "Missed"].includes(status)) {
      return res.status(400).json({ message: "Status must be Taken or Missed." });
    }

    const medicine = await Medicine.findOne({
      _id: id,
      userId: req.session.userId,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    if (!medicine.days.includes(weekday)) {
      return res.status(400).json({ message: "This medicine is not scheduled for that weekday." });
    }

    const doseRecord = await DoseRecord.findOneAndUpdate(
      {
        userId: req.session.userId,
        medicineId: medicine._id,
        date,
      },
      {
        $set: { status },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({ doseRecord });
  } catch (error) {
    return res.status(500).json({ message: "Could not update dose status." });
  }
});

// Read the saved result of one dose for a specific day.
router.get("/:id/doses/:date", requireAuth, async (req, res) => {
  try {
    const { id, date } = req.params;

    const medicine = await Medicine.findOne({
      _id: id,
      userId: req.session.userId,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    const doseRecord = await DoseRecord.findOne({
      userId: req.session.userId,
      medicineId: medicine._id,
      date,
    });

    if (!doseRecord) {
      return res.status(404).json({
        message: "No dose status recorded for this date.",
      });
    }

    return res.json({ doseRecord });
  } catch (error) {
    return res.status(500).json({
      message: "Could not load dose status.",
    });
  }
});

module.exports = router;
