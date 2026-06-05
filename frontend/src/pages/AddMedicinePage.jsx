import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
const FORMS = ["tablet", "capsule", "syrup", "injection", "drops", "other"];

const blankSchedule = () => ({ time: "08:00", frequency: "daily", daysOfWeek: [] });

export default function AddMedicinePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    form: "tablet",
    notes: "",
    color: "#3b82f6",
    reminderEmail: true,
    reminderBrowser: true,
    reminderSMS: false,
    familyMember: "self",
    schedules: [blankSchedule()],
  });
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setFamily(data.user.family || [])).catch(() => {});
  }, []);

  const updateSchedule = (i, patch) => {
    const schedules = [...form.schedules];
    schedules[i] = { ...schedules[i], ...patch };
    setForm({ ...form, schedules });
  };
  const addSchedule = () => setForm({ ...form, schedules: [...form.schedules, blankSchedule()] });
  const removeSchedule = (i) =>
    setForm({
      ...form,
      schedules: form.schedules.length === 1 ? form.schedules : form.schedules.filter((_, x) => x !== i),
    });
  const toggleDay = (i, d) => {
    const s = form.schedules[i];
    const days = s.daysOfWeek.includes(d)
      ? s.daysOfWeek.filter((x) => x !== d)
      : [...s.daysOfWeek, d];
    updateSchedule(i, { daysOfWeek: days });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dosage) return toast.error("Name and dosage are required");
    for (const s of form.schedules) {
      if ((s.frequency === "weekly" || s.frequency === "custom") && s.daysOfWeek.length === 0) {
        return toast.error("Pick at least one day for weekly/custom schedules");
      }
    }
    setLoading(true);
    try {
      await api.post("/medicines", form);
      toast.success("Medicine added 🎉");
      navigate("/medicines");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Add a medicine
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        We'll send you an email reminder at every scheduled time.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <Section title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Medicine name *</label>
              <input
                className="input"
                placeholder="e.g. Metformin"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Dosage *</label>
              <input
                className="input"
                placeholder="e.g. 500 mg"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Form</label>
              <select
                className="input"
                value={form.form}
                onChange={(e) => setForm({ ...form, form: e.target.value })}
              >
                {FORMS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">For</label>
              <select
                className="input"
                value={form.familyMember}
                onChange={(e) => setForm({ ...form, familyMember: e.target.value })}
              >
                <option value="self">Myself</option>
                {family.map((f) => (
                  <option key={f._id} value={f.name}>
                    {f.name} {f.relation ? `(${f.relation})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea
                rows={2}
                className="input"
                placeholder="Take with food, etc."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Color"
          subtitle="Personalize the card color in your dashboard"
        >
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`h-9 w-9 rounded-xl transition ${
                  form.color === c ? "ring-2 ring-offset-2 ring-brand-500 ring-offset-white dark:ring-offset-slate-900" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </Section>

        <Section title="Schedules" subtitle="Add one or more times per day">
          <div className="space-y-3">
            {form.schedules.map((s, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="grid items-end gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label">Time</label>
                    <input
                      type="time"
                      className="input"
                      value={s.time}
                      onChange={(e) => updateSchedule(i, { time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Frequency</label>
                    <select
                      className="input"
                      value={s.frequency}
                      onChange={(e) => updateSchedule(i, { frequency: e.target.value })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly (specific days)</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSchedule(i)}
                      className="btn-ghost text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
                {(s.frequency === "weekly" || s.frequency === "custom") && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {DAYS.map((d, idx) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(i, idx)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          s.daysOfWeek.includes(idx)
                            ? "bg-brand-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addSchedule} className="btn-secondary w-full">
              <Plus className="h-4 w-4" /> Add another time
            </button>
          </div>
        </Section>

        <Section title="Reminder channels">
          <div className="grid gap-2 sm:grid-cols-3">
            <Toggle
              label="Email"
              checked={form.reminderEmail}
              onChange={(v) => setForm({ ...form, reminderEmail: v })}
            />
            <Toggle
              label="Browser"
              checked={form.reminderBrowser}
              onChange={(v) => setForm({ ...form, reminderBrowser: v })}
            />
            <Toggle
              label="SMS (coming soon)"
              checked={form.reminderSMS}
              onChange={(v) => setForm({ ...form, reminderSMS: v })}
              disabled
            />
          </div>
        </Section>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save medicine"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
