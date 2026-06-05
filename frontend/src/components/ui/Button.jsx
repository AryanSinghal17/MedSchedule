import { Loader2 } from "lucide-react";

export default function Button({
  variant = "primary",
  loading = false,
  icon: Icon,
  children,
  className = "",
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      disabled={loading || props.disabled}
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}
