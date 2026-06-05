import { Edit3, Trash2, Pill, Clock } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../../api/client.js";

export default function MedicineListItem({ medicine, onEdit, onChange }) {
  const { _id, name, dosage, form, color = "#3b82f6", schedules = [], notes } = medicine;

  const remove = async () => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await api.delete(`/medicines/${_id}`);
      toast.success("Medicine removed");
      onChange?.();
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="card p-4 transition hover:shadow-card">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-soft"
          style={{ background: color }}
        >
          <Pill className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
            <span className="pill bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {form}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{dosage}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {schedules.map((s, i) => (
              <span
                key={i}
                className="pill bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
              >
                <Clock className="h-3 w-3" /> {s.time} · {s.frequency}
              </span>
            ))}
          </div>
          {notes && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">📝 {notes}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit?.(medicine)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={remove}
            className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
