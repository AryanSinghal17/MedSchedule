import Medicine from "../models/Medicine.js";
import { nextDoseDate, dosesForDate, adherencePct } from "../utils/helpers.js";

export const createMedicine = async (req, res) => {
  const med = await Medicine.create({ ...req.body, user: req.user._id });
  res.status(201).json(med);
};

export const getMedicines = async (req, res) => {
  const meds = await Medicine.find({ user: req.user._id, active: true }).sort({ createdAt: -1 });
  res.json(meds);
};

export const getMedicine = async (req, res) => {
  const med = await Medicine.findOne({ _id: req.params.id, user: req.user._id });
  if (!med) return res.status(404).json({ message: "Not found" });
  res.json(med);
};

export const updateMedicine = async (req, res) => {
  const med = await Medicine.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!med) return res.status(404).json({ message: "Not found" });
  res.json(med);
};

export const deleteMedicine = async (req, res) => {
  const med = await Medicine.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { active: false },
    { new: true }
  );
  if (!med) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Medicine removed" });
};

export const markDose = async (req, res) => {
  const { logId } = req.params;
  const { status } = req.body; // "taken" or "skipped"
  const med = await Medicine.findOne({ "logs._id": logId, user: req.user._id });
  if (!med) return res.status(404).json({ message: "Log not found" });
  const log = med.logs.id(logId);
  log.status = status;
  log.takenAt = status === "taken" ? new Date() : null;
  await med.save();
  res.json(med);
};

export const getDashboard = async (req, res) => {
  const today = new Date();
  const medicines = await Medicine.find({ user: req.user._id, active: true });

  const todays = [];
  const upcoming = [];
  const missed = [];
  let totalTaken = 0;
  let totalDoses = 0;
  const medicineAdherence = [];

  for (const med of medicines) {
    // adherence window: last 30 days
    const window = new Date();
    window.setDate(window.getDate() - 30);
    const recent = med.logs.filter((l) => new Date(l.scheduledFor) >= window);
    totalTaken += recent.filter((l) => l.status === "taken").length;
    totalDoses += recent.length;
    if (recent.length > 0) {
      medicineAdherence.push({
        id: med._id,
        name: med.name,
        color: med.color,
        pct: adherencePct(recent),
        doses: recent.length,
      });
    }

    for (const sched of med.schedules) {
      const doses = dosesForDate(sched, today);
      doses.forEach((d) => {
        const log = med.logs.find(
          (l) => new Date(l.scheduledFor).getTime() === d.getTime()
        );
        const entry = {
          medicineId: med._id,
          logId: log?._id,
          name: med.name,
          dosage: med.dosage,
          form: med.form,
          color: med.color,
          time: sched.time,
          scheduledFor: d,
          status: log?.status || "pending",
        };
        if (d < today && (!log || log.status === "pending")) {
          missed.push({ ...entry, status: "missed" });
        } else {
          todays.push(entry);
        }
      });
    }
  }

  // upcoming: next 7 future doses
  const future = [];
  for (const med of medicines) {
    for (const sched of med.schedules) {
      const next = nextDoseDate(sched, today);
      if (next && next > today) {
        future.push({
          medicineId: med._id,
          name: med.name,
          dosage: med.dosage,
          color: med.color,
          time: sched.time,
          frequency: sched.frequency,
          nextDose: next,
        });
      }
    }
  }
  future.sort((a, b) => a.nextDose - b.nextDose);
  upcoming.push(...future.slice(0, 8));

  todays.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
  missed.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));

  const overallPct = totalDoses === 0 ? 0 : Math.round((totalTaken / totalDoses) * 100);

  res.json({
    today: todays,
    upcoming,
    missed,
    history: medicineAdherence,
    stats: {
      activeMedicines: medicines.length,
      todayCount: todays.length,
      missedCount: missed.length,
      adherencePct: overallPct,
    },
  });
};

export const getHistory = async (req, res) => {
  const medicines = await Medicine.find({ user: req.user._id }).sort({ createdAt: -1 });
  const items = [];
  for (const med of medicines) {
    for (const log of med.logs) {
      items.push({
        logId: log._id,
        medicineId: med._id,
        name: med.name,
        dosage: med.dosage,
        color: med.color,
        scheduledFor: log.scheduledFor,
        takenAt: log.takenAt,
        status: log.status,
      });
    }
  }
  items.sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor));
  res.json({ items, medicines });
};
