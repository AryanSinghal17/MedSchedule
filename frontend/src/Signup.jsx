import { useState } from "react";
import "./App.css";

import { API_URL } from "./api";

export default function Signup({ onLogIn, onSignupSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  // Validate the form, create the account, then start its login session.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Enter your full name.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords must match.");
      return;
    }

    setMessage("");

    try {
      const signupResponse = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setMessage(signupData.message || "Sign up failed.");
        return;
      }

      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setMessage("Account created. Please log in.");
        return;
      }

      onSignupSuccess(loginData.user);
    } catch (error) {
      console.error("Signup request failed:", error);
      setMessage("Could not connect to the server.");
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

      <form onSubmit={handleSubmit}>
        <h2>Sign up</h2>
        <p>Enter your name, email, and a password to create an account.</p>

        <div>
          <label htmlFor="signupName">Full name</label>
          <input
            id="signupName"
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
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? "Hide passwords" : "Show passwords"}
        </button>

        <button type="submit">Create account</button>
        <p role="status">{message}</p>

        <button type="button" onClick={onLogIn}>
          Already have an account? Log in
        </button>
      </form>
    </main>
  );
}