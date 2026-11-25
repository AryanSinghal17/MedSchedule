const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const doseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Taken", "Missed"],
      default: "Pending",
    },
    emailLeaseToken: String,
    emailLeaseUntil: Date,
    emailSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

doseSchema.index(
  { userId: 1, medicineId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("DoseRecord", doseSchema);
