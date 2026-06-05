import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import toast from "react-hot-toast";
import { Save, Lock, User, Users, Plus, Trash2, Heart } from "lucide-react";
import api from "../api/client.js";

export default function SettingsPage() {
  const { user, setUser, logout, loadUser } = useAuth();
  const { elderly, setElderly } = useTheme();
  const [profile, setProfile] = useState({ name: "", phone: "", timezone: "" });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [member, setMember] = useState({ name: "", relation: "", age: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        phone: user.phone || "",
        timezone: user.timezone || "UTC",
      });
    }
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", profile);
      setUser(data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/password", { currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: "", next: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!member.name) return;
    try {
      const { data } = await api.post("/users/family", {
        name: member.name,
        relation: member.relation,
        age: member.age ? Number(member.age) : undefined,
      });
      setUser(data.user);
      setMember({ name: "", relation: "", age: "" });
      toast.success("Family member added");
    } catch {
      toast.error("Failed");
    }
  };

  const removeMember = async (id) => {
    try {
      const { data } = await api.delete(`/users/family/${id}`);
      setUser(data.user);
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Manage your account, family, and preferences.
        </p>
      </div>

      <Section icon={User} title="Profile">
        <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={user?.email || ""} disabled />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              placeholder="+1 555-123-4567"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Timezone</label>
            <input
              className="input"
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      </Section>

      <Section icon={Lock} title="Change password">
        <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              minLength={6}
              className="input"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary">
              Update password
            </button>
          </div>
        </form>
      </Section>

      <Section icon={Users} title="Family medicine management">
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Add people you care for (parents, kids, spouse) so you can schedule medicines on their behalf.
        </p>
        <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-4">
          <input
            className="input sm:col-span-1"
            placeholder="Name"
            value={member.name}
            onChange={(e) => setMember({ ...member, name: e.target.value })}
          />
          <input
            className="input sm:col-span-1"
            placeholder="Relation (mother, son...)"
            value={member.relation}
            onChange={(e) => setMember({ ...member, relation: e.target.value })}
          />
          <input
            className="input sm:col-span-1"
            type="number"
            placeholder="Age"
            value={member.age}
            onChange={(e) => setMember({ ...member, age: e.target.value })}
          />
          <button type="submit" className="btn-primary sm:col-span-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {(user?.family || []).map((m) => (
            <li
              key={m._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {m.relation || "—"} {m.age ? `· ${m.age} y/o` : ""}
                </p>
              </div>
              <button
                onClick={() => removeMember(m._id)}
                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={Heart} title="Accessibility">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Elderly-friendly mode</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Larger text, bigger buttons, and more spacing.
            </p>
          </div>
          <button
            onClick={() => setElderly(!elderly)}
            className={`relative h-6 w-11 rounded-full transition ${
              elderly ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                elderly ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={logout} className="btn bg-rose-600 text-white hover:bg-rose-700">
          Sign out
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-brand-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
