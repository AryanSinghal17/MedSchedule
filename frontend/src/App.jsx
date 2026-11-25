import { useEffect, useRef, useState } from "react";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";
import MedicineForm from "./MedicineForm";
import Navbar from "./Navbar";

import { API_URL } from "./api";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [medicines, setMedicines] = useState([]);
  const deletionsDuringLoad = useRef(null);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    // Ask Express which account owns the current session cookie.
    async function restoreSession() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          setScreen("login");
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setScreen("dashboard");
      } catch (error) {
        console.error("Could not check login session:", error);
        setUser(null);
        setScreen("login");
      } finally {
        setLoadingSession(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (screen !== "dashboard" || !user) return;

    const controller = new AbortController();
    const deletedIds = new Set();
    deletionsDuringLoad.current = deletedIds;
    // Load saved schedules and their dose status for the active day.
    async function loadMedicines() {
      try {
        const response = await fetch(`${API_URL}/api/medicines`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          setNotice(data.message || "Could not load medicines.");
          return;
        }

        // A list request can finish after the user deletes a row.
        if (!controller.signal.aborted) {
          setMedicines(data.medicines.filter(item => !deletedIds.has(item._id)));
        }
      } catch (error) {
        if (!controller.signal.aborted) setNotice(error.message);
      } finally {
        if (deletionsDuringLoad.current === deletedIds) deletionsDuringLoad.current = null;
      }
    }

    loadMedicines();
    return () => controller.abort();
  }, [screen, user]);

  // Require a signed-in user before opening a medicine screen.
  function navigateTo(page) {
    const requiresLogin = page === "dashboard" || page === "medicine";

    if (requiresLogin && !user) {
      setScreen("login");
      return;
    }

    setEditingMedicine(null);
    setScreen(page);
  }

  function handleLoginSuccess(loggedInUser) {
    setUser(loggedInUser);
    // Entering the dashboard triggers its medicine request.
    setScreen("dashboard");
  }

  function handleSignupSuccess(newUser) {
    setUser(newUser);
    // Entering the dashboard triggers its medicine request.
    setScreen("dashboard");
  }

  // Create or edit a schedule and return to the list after a successful save.
  async function saveMedicine(medicine) {
    const isEditing = Boolean(editingMedicine);
    const url = isEditing
      ? `${API_URL}/api/medicines/${editingMedicine._id}`
      : `${API_URL}/api/medicines`;

    const response = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(medicine),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not save medicine.");
    }

    if (isEditing) {
      setMedicines((previous) =>
        previous.map((item) =>
          item._id === data.medicine._id ? data.medicine : item
        )
      );
    } else {
      setMedicines((previous) => [...previous, data.medicine]);
    }

    setEditingMedicine(null);
    setFilter("All");
    setScreen("dashboard");
  }

  // Old: markTaken only called setMedicines(), so a reload lost the change.
  // Save this day's status first, then display the value confirmed by Express.
  async function recordDose(medicine, status) {
    setNotice("");
    try {
      const url = API_URL + "/api/medicines/" + medicine._id + "/doses/" + medicine.doseDate;
      const response = await fetch(url, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update dose.");
      setMedicines(previous => previous.map(item => item._id === medicine._id
        ? { ...item, status: data.doseRecord.status } : item));
    } catch (error) {
      setNotice(error.message);
    }
  }

  // Remove a schedule from the list after the API confirms deletion.
  async function deleteMedicine(id) {
    try {
      const response = await fetch(`${API_URL}/api/medicines/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Could not delete medicine.");
        return;
      }

      deletionsDuringLoad.current?.add(id);
      setMedicines((previous) =>
        previous.filter((medicine) => medicine._id !== id)
      );
    } catch (error) {
      console.error("Could not delete medicine:", error);
    }
  }

  // Open the form with the selected schedule.
  function editMedicine(medicine) {
    setEditingMedicine(medicine);
    setScreen("medicine");
  }

  // Clear the selection for a new schedule.
  function openAddMedicine() {
    setEditingMedicine(null);
    setScreen("medicine");
  }

  // Return to the list without submitting the form.
  function cancelMedicine() {
    setEditingMedicine(null);
    setScreen("dashboard");
  }

  // End the server session and clear this account from React.
  async function handleLogout() {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Could not log out.");
        return;
      }

      setUser(null);
      setNotice("");
      setMedicines([]);
      setEditingMedicine(null);
      setScreen("login");
    } catch (error) {
      console.error("Could not log out:", error);
    }
  }

  if (loadingSession) {
    return <p>Checking your session...</p>;
  }

  if (!user && (screen === "dashboard" || screen === "medicine")) {
    return (
      <>
        <Navbar screen="login" onNavigate={navigateTo} />
        <Login
          onSignUp={() => navigateTo("signup")}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  if (screen === "medicine") {
    return (
      <>
        <Navbar
          screen={screen}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
        <MedicineForm
          onSave={saveMedicine}
          medicine={editingMedicine}
          onCancel={cancelMedicine}
        />
      </>
    );
  }

  if (screen === "dashboard") {
    const sortedMedicines = [...medicines].sort((a, b) =>
      a.reminderTime.localeCompare(b.reminderTime)
    );

    const visibleMedicines = sortedMedicines.filter(
      (medicine) => filter === "All" || (medicine.scheduledToday && (medicine.status ?? "Pending") === filter)
    );

    return (
      <>
        <Navbar
          screen={screen}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />

        <main className="dashboard">
          {notice && <p role="alert">{notice}</p>}
          <header className="schedule-heading">
            <span className="schedule-label">Your schedule</span>
            <h1>My medicines</h1>
            <p>
              {medicines.length}{" "}
              {medicines.length === 1 ? "medicine" : "medicines"} · sorted by
              time
            </p>
          </header>

          <div className="dashboard-controls">
            <div
              className="medicine-filters"
              role="group"
              aria-label="Filter medicines"
            >
              {["All", "Taken", "Missed", "Pending"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  aria-pressed={filter === status}
                >
                  {status}
                </button>
              ))}
            </div>

            <button type="button" onClick={openAddMedicine}>
              Add medicine
            </button>
          </div>

          <div className="table-wrapper">
            <table className="medicine-table" aria-label="My medicines">
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Medicine name</th>
                  <th scope="col">Prescribed dose</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleMedicines.map((medicine) => (
                  <tr key={medicine._id}>
                    <td>
                      <span className="medicine-time">
                        {medicine.reminderTime}
                      </span>
                    </td>
                    <td>
                      <strong>{medicine.name}</strong>
                      <br />
                      <small>
                        {medicine.emailReminder
                          ? "Email reminder on"
                          : "No email reminder"}
                      </small>
                    </td>
                    <td>{medicine.dose}</td>
                    <td>
                      <span
                        className="medicine-status"
                        data-status={medicine.scheduledToday === false ? "Off today" : medicine.status || "Pending"}
                      >
                        {medicine.scheduledToday === false ? "Off today" : medicine.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => recordDose(medicine, "Taken")}
                        disabled={!medicine.scheduledToday || medicine.status === "Taken"}
                      >
                        {medicine.status === "Taken"
                          ? "Taken ✓"
                          : "Mark taken"}
                      </button>
                      <button
                        type="button"
                        disabled={!medicine.scheduledToday || medicine.status === "Missed"}
                        onClick={() => recordDose(medicine, "Missed")}
                      >
                        Mark missed
                      </button>
                      <button
                        type="button"
                        onClick={() => editMedicine(medicine)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMedicine(medicine._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {visibleMedicines.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      {medicines.length === 0
                        ? "Add your first medicine to get started."
                        : `No medicines match the ${filter.toLowerCase()} filter.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </>
    );
  }

  if (screen === "login") {
    return (
      <>
       <Navbar screen={screen} onNavigate={navigateTo} onLogout={handleLogout} />
        <Login
          onSignUp={() => navigateTo("signup")}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Navbar screen={screen} onNavigate={navigateTo} />
      <Signup
        onLogIn={() => navigateTo("login")}
        onSignupSuccess={handleSignupSuccess}
      />
    </>
  );
}