import { useRef, useState } from "react";
import "./App.css";

import { apiRequest } from "./api";

export default function Signup({ onLogIn, onSignupSuccess, onBusyChange }) {
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  // Validate the form, create the account, then start its login session.
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;

    if (!name.trim()) {
      setMessage("Enter your full name.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords must match.");
      return;
    }

    setMessage("");
    submitting.current = true;
    setPending(true);
    onBusyChange("auth");
    let accountCreated = false;

    try {
      await apiRequest("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      accountCreated = true;
      const loginData = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      onSignupSuccess(loginData);
    } catch (error) {
      setMessage(accountCreated ? "Account created. Please log in to continue." : error.message);
    } finally {
      submitting.current = false;
      setPending(false);
      onBusyChange("");
    }
  }

  return (
    <main className="signup-layout">
      <section className="signup-intro">
        <p className="intro-label">Get started</p>
        <h1>
          Create your
          <br />
          MedSchedule account
        </h1>
        <p>Sign up once, add your medicines, and let reminders help you.</p>
        <ul>
          <li>Free personal dashboard</li>
          <li>One schedule, sorted by time</li>
          <li>Email reminders you can turn on per medicine</li>
        </ul>
      </section>

      <form onSubmit={handleSubmit} aria-busy={pending}>
        <h2>Sign up</h2>
        <p>Enter your name, email, and a password to create an account.</p>

        <div>
          <label htmlFor="signupName">Full name</label>
          <input
            id="signupName"
            disabled={pending}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="signupEmail">Email</label>
          <input
            id="signupEmail"
            disabled={pending}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="signupPassword">Password</label>
          <input
            id="signupPassword"
            minLength={8}
            aria-describedby="passwordRequirements"
            disabled={pending}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <small id="passwordRequirements">Use at least 8 characters.</small>
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            minLength={8}
            disabled={pending}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="button"
          disabled={pending}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? "Hide passwords" : "Show passwords"}
        </button>

        <button type="submit" disabled={pending}>{pending ? "Creating account..." : "Create account"}</button>
        <p role="status">{message}</p>

        <button type="button" disabled={pending} onClick={onLogIn}>
          Already have an account? Log in
        </button>
      </form>
    </main>
  );
}
