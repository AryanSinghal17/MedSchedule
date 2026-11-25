const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Medicine = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    dose: {
      type: String,
      required: true,
      trim: true
    },
    reminderTime: {
      type: String,
      required: true,
    },
    days: {
      type: [String],
      required: true,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    emailReminder: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Medicine", Medicine);
