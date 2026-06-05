# 💊 MedSedule

> A modern full-stack medicine reminder app. Schedule medicines, get automatic email reminders at the right time, and track your adherence with a beautiful dashboard.

![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node%20%7C%20MongoDB%20%7C%20Tailwind-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 🔐 **JWT authentication** — signup, login, secure password hashing (bcrypt).
- 💊 **Medicine scheduler** — name, dosage, form, color, notes.
- ⏰ **Flexible timing** — daily, weekly (specific days), or custom.
- 📧 **Automatic email reminders** — Nodemailer + Gmail SMTP, beautiful HTML templates.
- 🕒 **Cron engine** — checks every minute (`node-cron`) and a separate job that marks missed doses every 5 minutes.
- 📊 **Dashboard** — today's medicines, upcoming, missed, adherence ring, per-medicine stats.
- ✅ **Mark as taken** — one-tap buttons that update adherence in real-time.
- 🌗 **Dark mode + 👵 Elderly mode** — accessibility built in.
- 👨‍👩‍👧 **Family management** — schedule medicines for your parents, kids, etc.
- 🔔 **Browser notifications** — also pings you on the device.
- 📱 **Mobile-friendly** — sidebar collapses to a slide-in drawer.

---

## 📁 Project structure

```
medsedule/
├── backend/                    # Node + Express API
│   ├── config/db.js            # Mongo connection
│   ├── controllers/            # auth, medicine, user logic
│   ├── cron/reminderCron.js    # node-cron jobs
│   ├── middleware/auth.js      # JWT protect middleware
│   ├── models/                 # Mongoose schemas (User, Medicine)
│   ├── routes/                 # Express routers
│   ├── services/emailService.js# Nodemailer
│   ├── utils/helpers.js        # Time + schedule helpers
│   ├── utils/seed.js           # Demo data seeder
│   └── server.js
│
├── frontend/                   # React + Vite + Tailwind
│   └── src/
│       ├── api/client.js       # Axios w/ JWT interceptor
│       ├── components/         # Reusable UI
│       │   ├── layout/         # Sidebar, Topbar, ProtectedLayout
│       │   ├── medicine/       # DoseCard, AdherenceRing, ...
│       │   └── ui/             # Button, Card, ThemeToggle
│       ├── context/            # Auth + Theme providers
│       ├── pages/              # Landing, Login, Register, Dashboard,
│       │                       # AddMedicine, Medicines, History, Settings
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css           # Tailwind + custom utility classes
│
└── README.md (this file)
```

---

## 🚀 Quick start

### 1. Prerequisites
- **Node.js 18+**
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A **Gmail account** + a [Gmail App Password](https://myaccount.google.com/apppasswords) (regular password won't work with SMTP)

### 2. Backend
```bash
cd backend
cp .env.example .env       # then edit values (see below)
npm install
npm run dev                # starts on http://localhost:5000
```

#### `.env` cheatsheet
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medsedule
JWT_SECRET=any_long_random_string

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM_NAME=MedSedule

CLIENT_URL=http://localhost:5173
```

> If you skip the SMTP fields, the server still runs — emails just get a `⚠️ SMTP not configured` warning in the console so you can develop the rest of the app.

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # default points to http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

Open **http://localhost:5173**, register an account, and start scheduling medicines.

### 4. Build for production
```bash
cd frontend && npm run build      # → dist/
cd ../backend && NODE_ENV=production npm start
```

---

## 🗄️ Data models

### User
```
{
  name, email, password (hashed), phone, timezone,
  accessibilityMode,
  family: [{ name, relation, age }]
}
```

### Medicine
```
{
  user, familyMember, name, dosage, form, notes, color,
  schedules: [{ time, frequency, daysOfWeek, startDate, endDate }],
  logs: [{ scheduledFor, takenAt, status: pending|taken|missed|skipped }],
  reminderEmail, reminderBrowser, reminderSMS, active
}
```

---

## 🔌 API endpoints

| Method | Endpoint                              | Description                       | Auth |
|--------|---------------------------------------|-----------------------------------|------|
| POST   | `/api/auth/signup`                    | Register                          | ✗    |
| POST   | `/api/auth/login`                     | Login → returns JWT               | ✗    |
| GET    | `/api/auth/me`                        | Current user                      | ✓    |
| GET    | `/api/medicines/dashboard`            | Aggregated dashboard data         | ✓    |
| GET    | `/api/medicines/history`              | All logs (filterable on frontend) | ✓    |
| GET    | `/api/medicines`                      | List user medicines               | ✓    |
| POST   | `/api/medicines`                      | Add medicine                      | ✓    |
| PUT    | `/api/medicines/:id`                  | Update                            | ✓    |
| DELETE | `/api/medicines/:id`                  | Soft-delete (active=false)        | ✓    |
| PATCH  | `/api/medicines/:id/dose/:logId`      | Mark dose taken/skipped           | ✓    |
| PUT    | `/api/users/profile`                  | Update profile / family           | ✓    |
| PUT    | `/api/users/password`                 | Change password                   | ✓    |
| POST   | `/api/users/family`                   | Add family member                 | ✓    |
| DELETE | `/api/users/family/:memberId`         | Remove family member              | ✓    |

All `✓` endpoints require `Authorization: Bearer <token>` header.

---

## ⏰ How the reminder engine works

1. A `node-cron` job fires **every minute** (`* * * * *`).
2. It queries all active medicines where `schedules.time` equals the current `HH:MM`.
3. For each match, it verifies the day-of-week matches the schedule's `frequency` (`daily` / `weekly` / `custom`).
4. If a `logs` entry for that exact dose doesn't exist yet, it creates a `pending` one.
5. It calls `sendReminderEmail()` with a beautiful HTML template.
6. A **second** cron job runs every 5 minutes and flips `pending` → `missed` for any dose more than 30 minutes overdue.

---

## 🎨 UI/UX notes

- **Blue + white** healthcare palette via Tailwind's `brand` color scale.
- **Sidebar navigation** with a topbar (mobile drawer included).
- **Cards** everywhere with soft shadows + subtle hover lift.
- **Smooth animations** powered by `framer-motion`.
- **Responsive grid** — works from 320px to 4K.
- **Dark mode** + **elderly mode** (larger fonts/buttons) toggleable in Settings.

---

## 🛠️ Tech stack

| Layer    | Tech                                          |
|----------|-----------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios, react-router-dom, react-hot-toast |
| Backend  | Node.js, Express 4, Mongoose 8, JWT, bcrypt, express-validator, node-cron, nodemailer |
| DB       | MongoDB (local or Atlas)                      |
| Email    | Gmail SMTP via Nodemailer                     |

---

## 📦 Optional: seed demo data

`backend/utils/seed.js` (in this repo) inserts a demo user + 3 medicines. Run with:
```bash
cd backend && npm run seed
```

---

## 🤝 Contributing
PRs welcome. For major changes, open an issue first.

---

## 📄 License
MIT — do whatever, just don't sue. ✌️
