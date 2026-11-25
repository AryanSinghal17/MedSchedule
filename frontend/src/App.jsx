import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";
import MedicineForm from "./MedicineForm";
import Navbar from "./Navbar";
import { apiRequest, scheduleDate, SCHEDULE_TIMEZONE } from "./api";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [timeZone, setTimeZone] = useState(SCHEDULE_TIMEZONE);
  const [sessionState, setSessionState] = useState("loading");
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [medicines, setMedicines] = useState([]);
  const [listState, setListState] = useState("loading");
  const [listError, setListError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [busy, setBusy] = useState("");
  const busyRef = useRef("");
  const listRequest = useRef(null);
  const revision = useRef(0);
  function setOperation(value) { busyRef.current = value; setBusy(value); }
  const expireSession = useCallback(() => {
    revision.current++;
    listRequest.current?.abort();
    setUser(null); setMedicines([]); setEditingMedicine(null); setFilter("All");
    setScreen("login"); setNotice("Your session has expired. Please log in again.");
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/api/auth/me", { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      setUser(data.user); setTimeZone(data.timeZone || SCHEDULE_TIMEZONE); setScreen("dashboard"); setSessionState("ready");
    }).catch(error => {
      if (controller.signal.aborted) return;
      if (error.status === 401) setSessionState("ready");
      else { setSessionState("error"); setNotice(error.message); }
    });
    return () => controller.abort();
  }, [sessionAttempt]);

  const loadMedicines = useCallback(async () => {
    if (busyRef.current) return;
    listRequest.current?.abort();
    const controller = new AbortController();
    listRequest.current = controller;
    const startedAt = revision.current;
    setListState("loading");
    setListError("");
    try {
      const data = await apiRequest("/api/medicines", { signal: controller.signal });
      if (controller.signal.aborted || startedAt !== revision.current) return;
      setMedicines(data.medicines); setTimeZone(data.timeZone || SCHEDULE_TIMEZONE); setListState("ready");
    } catch (error) {
      if (controller.signal.aborted || startedAt !== revision.current) return;
      if (error.status === 401) expireSession();
      else { setListState("error"); setListError(error.message); }
    }
  }, [expireSession]);

  useEffect(() => {
    if (!user || screen !== "dashboard") return;
    const refresh = () => { if (!document.hidden) loadMedicines(); };
    const initial = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(initial); clearInterval(timer); listRequest.current?.abort();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [user, screen, loadMedicines]);

  function navigateTo(page) {
    if (busyRef.current) return;
    const destination = user ? (["dashboard", "medicine"].includes(page) ? page : "dashboard")
      : (page === "signup" ? "signup" : "login");
    setNotice(""); setEditingMedicine(null);
    if (destination === "dashboard" && screen !== "dashboard") setListState("loading");
    setScreen(destination);
  }
  function handleAuthSuccess(data) {
    setUser(data.user); setTimeZone(data.timeZone || SCHEDULE_TIMEZONE); setNotice(""); setMedicines([]);
    setListState("loading"); setFilter("All"); setScreen("dashboard");
  }
  async function mutate(operation, path, options, onSuccess) {
    if (busyRef.current) return;
    setOperation(operation); revision.current++; listRequest.current?.abort(); setNotice("");
    try {
      const data = await apiRequest(path, options);
      onSuccess(data);
      return data;
    } catch (error) {
      if (error.status === 401) expireSession();
      else if (operation !== "save") setNotice(error.message);
      throw error;
    } finally { setOperation(""); }
  }
  async function saveMedicine(medicine) {
    const id = editingMedicine?._id;
    await mutate("save", `/api/medicines${id ? `/${id}` : ""}`, {
      method: id ? "PATCH" : "POST", body: JSON.stringify(medicine),
    }, data => {
      // The original save endpoint returns the schedule without daily dose metadata.
      const doseDate = scheduleDate(timeZone);
      const weekday = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }).format(new Date());
      setMedicines(previous => {
        const existing = previous.find(item => item._id === id);
        const saved = {
          ...data.medicine,
          doseDate,
          scheduledToday: data.medicine.days.includes(weekday),
          status: existing?.doseDate === doseDate ? existing.status : "Pending",
        };
        return id ? previous.map(item => item._id === id ? saved : item) : [...previous, saved];
      });
      setEditingMedicine(null); setFilter("All"); setListState("loading"); setScreen("dashboard");
    });
  }
  async function recordDose(medicine, status) {
    if (listState !== "ready" || busyRef.current) return;
    if (medicine.doseDate !== scheduleDate(timeZone)) {
      await loadMedicines();
      setNotice("The schedule day changed. Review today's schedule before marking a dose.");
      return;
    }
    try {
      await mutate(`dose:${medicine._id}`, `/api/medicines/${medicine._id}/doses/${medicine.doseDate}`, {
        method: "PUT", body: JSON.stringify({ status }),
      }, data => setMedicines(previous => previous.map(item => item._id === medicine._id
        ? { ...item, status: data.doseRecord.status } : item)));
    } catch { /* The shared request handler displays the error. */ }
  }
  async function deleteMedicine(id) {
    if (listState !== "ready") return;
    try {
      await mutate(`delete:${id}`, `/api/medicines/${id}`, { method: "DELETE" }, () => {
        setMedicines(previous => previous.filter(item => item._id !== id));
      });
    } catch { /* The shared request handler displays the error. */ }
  }
  async function handleLogout() {
    if (!user) return;
    try {
      await mutate("logout", "/api/auth/logout", { method: "POST" }, () => {
        setUser(null); setMedicines([]); setEditingMedicine(null); setFilter("All"); setScreen("login");
      });
    } catch {
      // Resume a list request cancelled by the failed logout attempt.
      if (screen === "dashboard") void loadMedicines();
    }
  }

  if (sessionState !== "ready") return <main className="session-message">
    {sessionState === "loading" ? <p role="status">Checking your session...</p> : <>
      <p role="alert">{notice}</p>
      <button onClick={() => { setSessionState("loading"); setNotice(""); setSessionAttempt(value => value + 1); }}>Retry connection</button>
    </>}
  </main>;
  const rows = [...medicines].sort((a, b) => a.reminderTime.localeCompare(b.reminderTime))
    .filter(item => filter === "All" || (item.scheduledToday && item.status === filter));
  const actionsDisabled = Boolean(busy) || listState !== "ready";
  return <>
    <Navbar screen={editingMedicine && screen === "medicine" ? "edit" : screen} user={user} busy={busy} onNavigate={navigateTo} onLogout={handleLogout} />
    {notice && <div className="app-notice" role="alert">{notice}</div>}
    {!user ? (screen === "signup"
      ? <Signup onLogIn={() => navigateTo("login")} onSignupSuccess={handleAuthSuccess} onBusyChange={setOperation} />
      : <Login onSignUp={() => navigateTo("signup")} onLoginSuccess={handleAuthSuccess} onBusyChange={setOperation} />)
      : screen === "medicine"
        ? <MedicineForm key={editingMedicine?._id || "new"} medicine={editingMedicine} onSave={saveMedicine}
          onCancel={() => navigateTo("dashboard")} timeZone={timeZone} disabled={Boolean(busy)} />
        : <main className="dashboard">
          <header className="schedule-heading">
            <span className="schedule-label">Your schedule</span><h1>My medicines</h1>
            <p>{medicines.length} {medicines.length === 1 ? "medicine" : "medicines"} · sorted by time</p>
            <p>All times in {timeZone}</p>
          </header>
          <div className="dashboard-controls">
            <div className="medicine-filters" role="group" aria-label="Filter medicines">
              {["All", "Taken", "Missed", "Pending"].map(status => <button key={status} type="button"
                onClick={() => setFilter(status)} aria-pressed={filter === status}>{status}</button>)}
            </div>
            <button type="button" disabled={Boolean(busy)} onClick={() => navigateTo("medicine")}>Add medicine</button>
          </div>
          {listState === "loading" && <p className="list-message" role="status">Loading your schedule...</p>}
          {listState === "error" && <div className="list-message">
            <p role="alert">{listError}</p>
            <p>Could not refresh your schedule. Previously loaded entries may be out of date.</p>
            <button disabled={Boolean(busy)} onClick={() => { setNotice(""); loadMedicines(); }}>Retry loading medicines</button>
          </div>}
          {busy.startsWith("dose:") && <p className="list-message" role="status">Updating dose...</p>}
          <div className="table-wrapper" aria-busy={listState === "loading"}>
            <table className="medicine-table" aria-label="My medicines">
              <thead><tr>{["Time", "Medicine name", "Prescribed dose", "Status", "Actions"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
              <tbody>
                {rows.map(medicine => <tr key={medicine._id}>
                  <td data-label="Time"><span className="medicine-time">{medicine.reminderTime}</span></td>
                  <td data-label="Medicine"><strong>{medicine.name}</strong><br /><small>{medicine.emailReminder ? "Email reminder on" : "No email reminder"}</small></td>
                  <td data-label="Prescribed dose">{medicine.dose}</td>
                  <td data-label="Status"><span className="medicine-status" data-status={medicine.scheduledToday ? medicine.status : "Off today"}>
                    {medicine.scheduledToday ? medicine.status : "Off today"}</span></td>
                  <td className="medicine-row-actions">
                    <button type="button" onClick={() => recordDose(medicine, "Taken")}
                      disabled={actionsDisabled || !medicine.scheduledToday || medicine.status === "Taken"}>
                      {medicine.status === "Taken" && medicine.scheduledToday ? "Taken ✓" : "Mark taken"}</button>
                    <button type="button" onClick={() => recordDose(medicine, "Missed")}
                      disabled={actionsDisabled || !medicine.scheduledToday || medicine.status === "Missed"}>Mark missed</button>
                    <button type="button" disabled={actionsDisabled} onClick={() => { setNotice(""); setEditingMedicine(medicine); setScreen("medicine"); }}>Edit</button>
                    <button type="button" disabled={actionsDisabled} onClick={() => deleteMedicine(medicine._id)}>
                      {busy === `delete:${medicine._id}` ? "Deleting..." : "Delete"}</button>
                  </td>
                </tr>)}
                {rows.length === 0 && listState === "ready" && <tr><td colSpan={5} className="empty-state">
                  {medicines.length === 0 ? "Add your first medicine to get started." : `No medicines match the ${filter.toLowerCase()} filter.`}
                </td></tr>}
              </tbody>
            </table>
          </div>
        </main>}
  </>;
}
