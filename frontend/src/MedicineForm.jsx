import { useRef, useState } from "react";
import "./App.css";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MedicineForm({ onSave, medicine, onCancel, timeZone, disabled }) {
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Read the form fields and pass the schedule to the parent save handler.
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current || disabled) return;

    const fields = new FormData(event.currentTarget);

    const days = fields.getAll("days");
    if (!fields.get("medicineName").trim() || !fields.get("dose").trim()) {
      setError("Enter a medicine name and prescribed dose.");
      return;
    }
    if (days.length === 0) {
      setError("Choose at least one weekday.");
      return;
    }

    setError("");
    submitting.current = true;
    setSaving(true);
    try {
      await onSave({
        name: fields.get("medicineName").trim(),
        dose: fields.get("dose").trim(),
        reminderTime: fields.get("reminderTime"),
        days,
        emailReminder: fields.has("emailReminder"),
      });
    } catch (cause) {
      setError(cause instanceof TypeError ? "Could not reach the server. Try again." : cause.message);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="signup-layout medicine-layout">
      <section className="signup-intro">
        <p className="intro-label">
          {medicine ? "Edit medicine" : "Add medicine"}
        </p>
        <h1>{medicine ? "Edit medicine" : "Add a medicine"}</h1>
        <p>Enter the prescribed dose and choose a daily reminder time.</p>
      </section>

      <form onSubmit={handleSubmit} onChange={() => setError("")} aria-busy={saving}>
        <h2>Medicine details</h2>

        <div>
          <label htmlFor="medicineName">Medicine name</label>
          <input
            id="medicineName"
            disabled={saving || disabled}
            name="medicineName"
            type="text"
            defaultValue={medicine?.name ?? ""}
            placeholder="e.g. Paracetamol"
            required
          />
        </div>

        <div>
          <label htmlFor="dose">Prescribed dose</label>
          <input
            id="dose"
            disabled={saving || disabled}
            name="dose"
            type="text"
            defaultValue={medicine?.dose ?? ""}
            placeholder="e.g. 1 tablet"
            required
          />
        </div>

        <div>
          <label htmlFor="reminderTime">Daily reminder time ({timeZone})</label>
          <input
            id="reminderTime"
            disabled={saving || disabled}
            name="reminderTime"
            type="time"
            defaultValue={medicine?.reminderTime ?? "08:00"}
            required
          />
        </div>

        <fieldset className="weekday-picker" disabled={saving || disabled}>
          <legend>Schedule days</legend>
          {weekdays.map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                name="days"
                value={day}
                defaultChecked={medicine?.days?.includes(day) ?? false}
              />
              {day}
            </label>
          ))}
        </fieldset>

        <label className="reminder-option">
          <input
            type="checkbox"
            name="emailReminder"
            disabled={saving || disabled}
            defaultChecked={medicine?.emailReminder ?? true}
          />
          <span>
            <strong>Email reminder</strong>
            <small>Send me an email when this medicine is due.</small>
          </span>
        </label>

        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={saving || disabled}>
          {saving ? "Saving..." : medicine ? "Save changes" : "Save medicine"}
        </button>

        <button type="button" disabled={saving || disabled} onClick={onCancel}>
          Cancel
        </button>
      </form>
    </main>
  );
}
