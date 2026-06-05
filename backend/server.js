import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import startReminderCron from "./cron/reminderCron.js";
import authRoutes from "./routes/auth.js";
import medicineRoutes from "./routes/medicines.js";
import userRoutes from "./routes/users.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL?.split(",") ?? "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "MedSedule API", time: new Date().toISOString() })
);
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/users", userRoutes);

app.use((err, _req, res, _next) => {
  console.error("🔥", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  startReminderCron();
  app.listen(PORT, () => console.log(`🚀 MedSedule API running on http://localhost:${PORT}`));
};
start();

export default app;
