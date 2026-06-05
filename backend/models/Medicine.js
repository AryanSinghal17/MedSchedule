import mongoose from "mongoose";

/**
 * Schedule entry — one concrete intake time on a day-of-week mask.
 * frequency: "daily" (every day) | "weekly" (specific weekdays) | "custom" (custom days[])
 */
const scheduleSchema = new mongoose.Schema(
  {
    time: { type: String, required: true }, // "HH:MM" 24h
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },
    daysOfWeek: {
      // 0 = Sunday ... 6 = Saturday  (used when frequency=weekly or custom)
      type: [Number],
      default: [],
      validate: {
        validator: (v) => v.every((d) => d >= 0 && d <= 6),
        message: "daysOfWeek must contain values 0-6",
      },
    },
    startDate: { type: Date, default: () => new Date() },
    endDate: { type: Date },
  },
  { _id: false }
);

const logSchema = new mongoose.Schema(
  {
    scheduledFor: { type: Date, required: true }, // exact timestamp of the dose
    takenAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "taken", "missed", "skipped"],
      default: "pending",
    },
  },
  { _id: false }
);

const medicineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    familyMember: { type: String, default: "self" }, // matches family member name or "self"

    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true }, // e.g. "500 mg", "1 tablet"
    form: {
      type: String,
      enum: ["tablet", "capsule", "syrup", "injection", "drops", "other"],
      default: "tablet",
    },
    notes: { type: String, trim: true, default: "" },

    schedules: { type: [scheduleSchema], required: true, validate: (v) => v.length > 0 },
    logs: { type: [logSchema], default: [] },

    reminderEmail: { type: Boolean, default: true },
    reminderBrowser: { type: Boolean, default: true },
    reminderSMS: { type: Boolean, default: false },

    color: { type: String, default: "#3b82f6" }, // UI accent
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.index({ user: 1, active: 1 });
medicineSchema.index({ "schedules.time": 1 });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
