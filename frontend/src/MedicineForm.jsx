import { useState } from "react";
import "./App.css";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MedicineForm({ onSave, medicine, onCancel }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Read the form fields and pass the schedule to the parent save handler.
  async function handleSubmit(event) {
    event.preventDefault();

    const fields = new FormData(event.currentTarget);

    const days = fields.getAll("days");
    if (days.length === 0) {
      setError("Choose at least one weekday.");
      return;
    }

    setError("");
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
      setSaving(false);
    }
  }

  return (
    <main className="signup-layout">
      <section className="signup-intro">
        <p className="intro-label">
          {medicine ? "Edit medicine" : "Add medicine"}
        </p>
        <h1>{medicine ? "Edit medicine" : "Add a medicine"}</h1>
        <p>Enter the prescribed dose and choose a daily reminder time.</p>
      </section>

      <form onSubmit={handleSubmit} onChange={() => setError("")}>
        <h2>Medicine details</h2>

        <div>
          <label htmlFor="medicineName">Medicine name</label>
          <input
            id="medicineName"
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
            name="dose"
            type="text"
            defaultValue={medicine?.dose ?? ""}
            placeholder="e.g. 1 tablet"
            required
          />
        </div>

        <div>
          <label htmlFor="reminderTime">Daily reminder time</label>
          <input
            id="reminderTime"
            name="reminderTime"
            type="time"
            defaultValue={medicine?.reminderTime ?? "08:00"}
            required
          />
        </div>

        <fieldset>
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
            defaultChecked={medicine?.emailReminder ?? true}
          />
          <span>
            <strong>Email reminder</strong>
            <small>Send me an email when this medicine is due.</small>
          </span>
        </label>

        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={saving}>
          {medicine ? "Save changes" : "Save medicine"}
        </button>

        <button type="button" disabled={saving} onClick={onCancel}>
          Cancel
        </button>
      </form>
    </main>
  );
}