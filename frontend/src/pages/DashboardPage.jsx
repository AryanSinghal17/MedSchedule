import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Pill,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Sparkles,
} from "lucide-react";

import api from "../api/client.js";
import Card, { StatCard } from "../components/ui/Card.jsx";
import DoseCard from "../components/medicine/DoseCard.jsx";
import AdherenceRing from "../components/medicine/AdherenceRing.jsx";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/medicines/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const id = setInterval(load, 60000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const {
    today = [],
    upcoming = [],
    missed = [],
    history = [],
    stats = {},
  } = data || {};

  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") return;

    today
      .filter(
        (d) =>
          d.status === "pending" &&
          new Date(d.scheduledFor) <= new Date()
      )
      .forEach((d) => {
        new Notification(`Time to take ${d.name}`, {
          body: `${d.dosage} · ${d.time}`,
          icon: "/pill.svg",
        });
      });
  }, [today]);

  if (loading) {
    return (
      <div className="grid animate-pulse gap-4">
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="card overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Sparkles className="h-4 w-4" />
              Today, {format(new Date(), "EEEE, MMM d")}
            </div>

            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              You have {stats.todayCount || 0} medicine
              {stats.todayCount === 1 ? "" : "s"} scheduled today
            </h2>

            <p className="mt-1 text-white/80">
              Your adherence is at{" "}
              <strong>{stats.adherencePct || 0}%</strong>
            </p>
          </div>

          <AdherenceRing
            percent={stats.adherencePct || 0}
            size={130}
            stroke={14}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Pill}
          label="Active medicines"
          value={stats.activeMedicines || 0}
          color="brand"
        />

        <StatCard
          icon={Clock}
          label="Today's doses"
          value={stats.todayCount || 0}
          color="emerald"
          hint={`${today.filter((d) => d.status === "pending").length} pending`}
        />

        <StatCard
          icon={AlertCircle}
          label="Missed"
          value={stats.missedCount || 0}
          color="rose"
          hint="last 24h"
        />

        <StatCard
          icon={TrendingUp}
          label="Adherence"
          value={`${stats.adherencePct || 0}%`}
          color="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Today's medicines
            </h3>

            <span className="pill bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {today.length} total
            </span>
          </div>

          {today.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All clear for today 🎉"
              body="No medicines scheduled."
            />
          ) : (
            <div className="space-y-3">
              {today.map((d, i) => (
                <DoseCard
                  key={`${d.medicineId}-${i}`}
                  dose={d}
                  onChange={load}
                />
              ))}
            </div>
          )}

          {/* Missed */}
          {missed.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-rose-600 dark:text-rose-400">
                Missed doses
              </h3>

              <div className="space-y-3">
                {missed.map((d, i) => (
                  <DoseCard
                    key={`missed-${i}`}
                    dose={d}
                    onChange={load}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
            Upcoming
          </h3>

          <Card>
            {upcoming.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                No upcoming doses.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcoming.map((u, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3.5"
                  >
                    <div
                      className="h-9 w-9 rounded-lg"
                      style={{ background: u.color }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {u.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {u.dosage} · {u.time}
                      </p>
                    </div>

                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(u.nextDose), {
                        addSuffix: true,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="mt-6 card p-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="mb-1 flex items-center gap-2 font-medium text-slate-900 dark:text-white">
              <CalendarClock className="h-4 w-4 text-brand-500" />
              Reminder engine
            </div>

            Reminders are checked every minute and sent automatically.
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="card flex flex-col items-center p-10 text-center">
      <Icon className="h-10 w-10 text-emerald-500" />

      <p className="mt-3 font-semibold text-slate-900 dark:text-white">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {body}
      </p>
    </div>
  );
}
