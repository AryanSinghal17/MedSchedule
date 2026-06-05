/**
 * Optional demo seeder. Run with: npm run seed
 * Creates a user "demo@medsedule.app" / "password123" with 3 medicines.
 */
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Medicine from "../models/Medicine.js";

const run = async () => {
  await connectDB();
  await User.deleteMany({ email: "demo@medsedule.app" });
  await Medicine.deleteMany({});

  const user = await User.create({
    name: "Demo User",
    email: "demo@medsedule.app",
    password: "password123",
    family: [{ name: "Mom", relation: "mother", age: 68 }],
  });

  const now = new Date();
  const inMinutes = (m) => {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + m);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  await Medicine.insertMany([
    {
      user: user._id,
      name: "Metformin",
      dosage: "500 mg",
      form: "tablet",
      color: "#3b82f6",
      notes: "Take with breakfast",
      schedules: [{ time: inMinutes(1), frequency: "daily", daysOfWeek: [] }],
    },
    {
      user: user._id,
      name: "Lisinopril",
      dosage: "10 mg",
      form: "tablet",
      color: "#10b981",
      notes: "For blood pressure",
      schedules: [
        { time: "08:00", frequency: "daily", daysOfWeek: [] },
        { time: "20:00", frequency: "daily", daysOfWeek: [] },
      ],
    },
    {
      user: user._id,
      familyMember: "Mom",
      name: "Vitamin D3",
      dosage: "1000 IU",
      form: "capsule",
      color: "#f59e0b",
      notes: "With fatty meal",
      schedules: [{ time: "09:00", frequency: "weekly", daysOfWeek: [1, 4] }],
    },
  ]);

  console.log("✅ Seeded demo@medsedule.app / password123");
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
