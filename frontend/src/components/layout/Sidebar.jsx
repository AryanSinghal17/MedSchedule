import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  PlusCircle,
  History,
  Settings,
  LogOut,
  HeartPulse,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-medicine", label: "Add Medicine", icon: PlusCircle },
  { to: "/medicines", label: "My Medicines", icon: Pill },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white p-5 transition-transform
                    dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                MedSedule
              </div>
              <div className="text-xs text-slate-500">Never miss a dose</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white shadow-soft">
          <p className="text-sm font-medium opacity-90">Hi, {user?.name?.split(" ")[0]} 👋</p>
          <p className="mt-1 text-xs opacity-80">Stay on top of your health today.</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="nav-link flex-1"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
