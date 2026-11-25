import { useState } from "react";
import "./App.css";

import { API_URL } from "./api";

export default function Login({ onSignUp, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  // Submit credentials and pass the signed-in user to App.
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      onLoginSuccess(data.user);
    } catch (error) {
      console.error("Login request failed:", error);
      setMessage("Could not connect to the server.");
    }
  }

  return (
    <main className="signup-layout">
      <section className="signup-intro">
        <p className="intro-label">Medicine reminder app</p>
        <h1>MedSchedule</h1>
        <p>Your daily medicines, in time order, with email reminders.</p>
        <ul>
          <li>See today’s schedule at a glance</li>
          <li>Mark doses taken and track progress</li>
          <li>Get email reminders for your medicines</li>
        </ul>
      </section>

      <form onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p>Log in to open your personal schedule.</p>

        <div>
          <label htmlFor="loginEmail">Email</label>
          <input
            id="loginEmail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? "Hide password" : "Show password"}
        </button>

        <button type="submit">Log in</button>
        <p role="status">{message}</p>

        <button type="button" onClick={onSignUp}>
          Create an account
        </button>
      </form>
    </main>
  );
}