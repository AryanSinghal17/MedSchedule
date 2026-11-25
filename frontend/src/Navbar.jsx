export default function Navbar({ screen, user, busy, onNavigate, onLogout }) {
  const pages = user ? [
    { id: "dashboard", label: "My medicines" },
    { id: "medicine", label: "Add medicine" },
  ] : [
    { id: "login", label: "Log in" },
    { id: "signup", label: "Sign up" },
  ];

  return (
    <header className="app-header">
      <div className="navbar-brand">
        <span className="navbar-logo" aria-hidden="true">
          +
        </span>

        <div>
          <strong>MedSchedule</strong>
          <p>Medicine reminders · Your daily schedule</p>
        </div>
      </div>

      <nav aria-label="Main navigation">
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            disabled={Boolean(busy)}
            aria-current={screen === page.id ? "page" : undefined}
            onClick={() => onNavigate(page.id)}
          >
            {page.label}
          </button>
        ))}
         {user && onLogout && (
          <button type="button" disabled={Boolean(busy)} onClick={onLogout}>
            {busy === "logout" ? "Logging out..." : "Log out"}
          </button>
        )}
      </nav>
    </header>
  );
}
