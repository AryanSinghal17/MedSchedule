export default function Navbar({ screen, onNavigate, onLogout }) {
  const pages = [
    { id: "login", label: "Log in" },
    { id: "signup", label: "Sign up" },
    { id: "dashboard", label: "My medicines" },
    { id: "medicine", label: "Add medicine" },
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
            aria-current={screen === page.id ? "page" : undefined}
            onClick={() => onNavigate(page.id)}
          >
            {page.label}
          </button>
        ))}
         {onLogout && (
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        )}
      </nav>
    </header>
  );
}