import { Menu, Bell, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar({ onMenu }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{today}</p>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name?.split(" ")[0] || "friend"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/add-medicine")}
            className="hidden items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Add medicine
          </button>
          <button
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse-dot" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-soft">
            {user?.name?.[0]?.toUpperCase() || "M"}
          </div>
        </div>
      </div>
    </header>
  );
}
