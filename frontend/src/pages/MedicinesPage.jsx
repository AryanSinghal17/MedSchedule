import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pill } from "lucide-react";
import api from "../api/client.js";
import MedicineListItem from "../components/medicine/MedicineListItem.jsx";
import AdherenceRing from "../components/medicine/AdherenceRing.jsx";

export default function MedicinesPage() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get("/medicines");
      setMeds(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My medicines
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {meds.length} active medicine{meds.length === 1 ? "" : "s"}
          </p>
        </div>
        <button onClick={() => navigate("/add-medicine")} className="btn-primary">
          <Plus className="h-4 w-4" /> Add medicine
        </button>
      </div>

      {loading ? (
        <div className="grid animate-pulse gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : meds.length === 0 ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <Pill className="h-10 w-10 text-brand-500" />
          <p className="mt-3 font-semibold text-slate-900 dark:text-white">No medicines yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Add your first medicine to start receiving automatic reminders.
          </p>
          <button onClick={() => navigate("/add-medicine")} className="btn-primary mt-4">
            <Plus className="h-4 w-4" /> Add medicine
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {meds.map((m) => (
            <MedicineListItem key={m._id} medicine={m} onChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}
