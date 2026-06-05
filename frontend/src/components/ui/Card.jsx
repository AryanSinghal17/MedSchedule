export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag className={`card ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function StatCard({ icon: Icon, label, value, hint, color = "brand" }) {
  const colors = {
    brand: "from-brand-500 to-brand-700",
    emerald: "from-emerald-500 to-emerald-700",
    rose: "from-rose-500 to-rose-700",
    amber: "from-amber-500 to-amber-600",
  };
  return (
    <div className="card p-5 transition hover:shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-soft`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
