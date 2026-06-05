import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Filter, History as HistoryIcon, Check, X, Clock } from "lucide-react";
import api from "../api/client.js";

const FILTERS = [
  { v: "all", label: "All" },
  { v: "taken", label: "Taken" },
  { v: "missed", label: "Missed" },
  { v: "pending", label: "Pending" },
  { v: "skipped", label: "Skipped" },
];

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/medicines/history")
      .then(({ data }) => setItems(data.items))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  const counts = useMemo(() => {
    const c = { taken: 0, missed: 0, pending: 0, skipped: 0 };
    for (const i of items) if (c[i.status] !== undefined) c[i.status]++;
    return c;
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Medicine history
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {items.length} total log{items.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Taken" value={counts.taken} color="emerald" icon={Check} />
        <Stat label="Missed" value={counts.missed} color="rose" icon={X} />
        <Stat label="Pending" value={counts.pending} color="amber" icon={Clock} />
        <Stat label="Skipped" value={counts.skipped} color="slate" icon={Filter} />
      </div>

      <div className="card p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          {FILTERS.map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`pill border transition ${
                filter === f.v
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center p-10 text-center">
            <HistoryIcon className="h-10 w-10 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">No history yet</p>
            <p className="mt-1 text-sm text-slate-500">Your medicine logs will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((it) => (
              <li key={it.logId} className="flex items-center gap-3 py-3">
                <div
                  className="h-9 w-9 rounded-lg"
                  style={{ background: it.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{it.name}</p>
                  <p className="text-xs text-slate-500">
                    {it.dosage} · {format(new Date(it.scheduledFor), "PPp")}
                  </p>
                </div>
                <StatusBadge status={it.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color, icon: Icon }) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    taken: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    missed: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    skipped: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <span className={`pill ${map[status] || ""}`}>
      {status}
    </span>
  );
}
