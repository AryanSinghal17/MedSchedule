import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pill,
  Bell,
  ShieldCheck,
  Calendar,
  HeartPulse,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Users,
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

const features = [
  {
    icon: Bell,
    title: "Smart email reminders",
    body: "Cron-driven engine pings your inbox the moment a dose is due. Never miss a beat.",
  },
  {
    icon: Calendar,
    title: "Daily · Weekly · Custom",
    body: "Schedule once, get reminders forever. Configure as many timings as you need per medicine.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "JWT auth, hashed passwords, isolated user data — built with the same patterns as production apps.",
  },
  {
    icon: Smartphone,
    title: "Mobile-friendly PWA-style UI",
    body: "Looks gorgeous on phones, tablets, and desktops. Dark mode and elderly mode built-in.",
  },
  {
    icon: Users,
    title: "Family-friendly",
    body: "Manage medicines for your parents, kids, or anyone in your care — all from one account.",
  },
  {
    icon: HeartPulse,
    title: "Adherence tracking",
    body: "See your weekly and monthly adherence with beautiful visualizations.",
  },
];

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* NAV */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <HeartPulse className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight">MedSedule</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto max-w-6xl px-4 pb-16 pt-12 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial="hidden" animate="show" variants={fade}>
            <motion.span
              variants={fade}
              custom={0}
              className="pill bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
            >
              ✨ Your medicines, on autopilot
            </motion.span>
            <motion.h1
              variants={fade}
              custom={1}
              className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Never forget a <span className="text-brand-600">dose</span> again.
            </motion.h1>
            <motion.p
              variants={fade}
              custom={2}
              className="mt-5 text-lg text-slate-600 dark:text-slate-300"
            >
              MedSedule sends automatic email reminders for every medicine you schedule.
              Track adherence, manage your family's meds, and stay healthy — all in one beautiful app.
            </motion.p>
            <motion.div
              variants={fade}
              custom={3}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/register" className="btn-primary">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary">
                I already have an account
              </Link>
            </motion.div>
            <motion.ul
              variants={fade}
              custom={4}
              className="mt-8 grid gap-2 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2"
            >
              {[
                "Unlimited medicines",
                "Email reminders",
                "Adherence analytics",
                "Family management",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {b}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-brand-500/20 to-brand-300/20 blur-2xl" />
            <div className="card overflow-hidden p-1">
              <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">Today's plan</p>
                    <p className="text-lg font-semibold">3 medicines due</p>
                  </div>
                  <Pill className="h-8 w-8 opacity-80" />
                </div>
                <div className="mt-5 space-y-2.5">
                  {[
                    { name: "Metformin", time: "8:00 AM", color: "#22d3ee" },
                    { name: "Lisinopril", time: "2:00 PM", color: "#facc15" },
                    { name: "Atorvastatin", time: "9:00 PM", color: "#f472b6" },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur"
                    >
                      <div
                        className="h-9 w-9 rounded-lg"
                        style={{ background: m.color }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs opacity-80">{m.time}</p>
                      </div>
                      <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs">pending</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 p-3 text-sm">
                  <Bell className="h-4 w-4" /> Next reminder in 12 minutes
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Everything you need to stay on track
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Built for patients, caregivers, and busy people who care about their health.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fade}
              custom={i}
              className="card p-6 transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white shadow-card sm:p-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to take control?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Set up your medicines in under a minute. We handle the rest.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-soft transition hover:bg-brand-50"
          >
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        © {new Date().getFullYear()} MedSedule · Built with React, Node, MongoDB
      </footer>
    </div>
  );
}
