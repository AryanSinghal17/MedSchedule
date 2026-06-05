import { format } from "date-fns";
import { Check, X, Clock, Pill } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/client.js";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  taken: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  missed: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
  skipped: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

export default function DoseCard({ dose, onChange }) {
  const { name, dosage, time, status, color = "#3b82f6", logId, scheduledFor, form } = dose;
  const canAct = status === "pending" || status === "missed";

  const mark = async (newStatus) => {
    if (!logId) {
      toast.error("No log to update yet");
      return;
    }
    try {
      await api.patch(`/medicines/${dose.medicineId}/dose/${logId}`, { status: newStatus });
      toast.success(newStatus === "taken" ? "Marked as taken 🎉" : "Marked as skipped");
      onChange?.();
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="card flex items-center gap-4 p-4 transition hover:shadow-card animate-fade-in">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-soft"
        style={{ background: color }}
      >
        <Pill className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-slate-900 dark:text-white">{name}</p>
          <span className={`pill border ${statusStyles[status]}`}>{status}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {dosage} · {form} ·{" "}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {time}
          </span>
          {scheduledFor && (
            <span className="ml-2 text-xs text-slate-400">
              · {format(new Date(scheduledFor), "p")}
            </span>
          )}
        </p>
      </div>
      {canAct && (
        <div className="flex gap-2">
          <button
            onClick={() => mark("skipped")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Skip"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => mark("taken")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-600"
            aria-label="Mark as taken"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
