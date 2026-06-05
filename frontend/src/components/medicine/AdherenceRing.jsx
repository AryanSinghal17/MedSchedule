export default function AdherenceRing({ percent = 0, size = 120, stroke = 12, label = "Adherence" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color =
    percent >= 80 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="-mt-[88px] flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{percent}%</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="mt-10" />
    </div>
  );
}
