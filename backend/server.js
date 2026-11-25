const cors = require("cors");
require("dotenv").config();



const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const reminderWorker = require("./routes/reminderWorker");
const requireAuth = require("./middleware/requireAuth");

const startReminderScheduler = require("./services/reminderScheduler");

const PORT = process.env.PORT || 3031;
const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = express();

const production = process.env.NODE_ENV === "production";
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3020";
if (production) app.set("trust proxy", 1);

// Accept browser requests from the configured React app.
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && origin !== frontendOrigin) {
    return res.status(403).json({ message: "Unrecognized browser origin." });
  }
  next();
});
app.use(express.json());

app.use(cors({
  // Old: origin: "http://localhost:3020" only supported local development.
  origin: frontendOrigin,
  credentials: true,
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: production ? "none" : "lax",
      secure: production,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/reminder-worker", reminderWorker);

app.get("/api/protected-test", requireAuth, (req, res) => {
  res.json({ message: "You are signed in." });
});

// Old: app.post("/api/test-email", ...) exposed a development mail sender.
// Scheduled reminders now supply recipients from the medicine owner's account.

app.get("/api/health", (req, res) => {
  res.json({ message: "MedSchedule API is running" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Render Free uses the external Google timer. Keep SMTP available for local development.
    if (!production && !process.env.REMINDER_WORKER_SECRET) startReminderScheduler();

    app.listen(PORT, () => {
      console.log(`Server is running at ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
