"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

export type Section = "A" | "B";

export type StudentRow = {
  id: string;
  name: string;
  section: Section;
  loginId: string;
  password: string | null;
  submissionCount: number;
};

type Credentials = { name: string; loginId: string; password: string };

const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L

function suggestPassword(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)];
  }
  return out;
}

export function StudentManager({ initialStudents }: { initialStudents: StudentRow[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [name, setName] = useState("");
  const [section, setSection] = useState<Section>("A");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StudentRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<StudentRow | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<"ALL" | Section>("ALL");
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (sectionFilter !== "ALL" && s.section !== sectionFilter) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, sectionFilter, search]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setAdding(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), section }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add student");
        return;
      }
      setStudents((prev) => [
        { ...data.student, password: data.password, submissionCount: 0 },
        ...prev,
      ]);
      setCredentials({
        name: data.student.name,
        loginId: data.student.loginId,
        password: data.password,
      });
      setName("");
    } catch {
      setError("Network error, please try again");
    } finally {
      setAdding(false);
    }
  }

  function openResetModal(student: StudentRow) {
    setResetTarget(student);
    setResetPassword(suggestPassword());
    setResetError(null);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    if (resetPassword.trim().length < 4) {
      setResetError("Password must be at least 4 characters");
      return;
    }
    setResetError(null);
    setResetBusy(true);
    try {
      const res = await fetch(`/api/students/${resetTarget.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error ?? "Could not reset password");
        return;
      }
      setStudents((prev) =>
        prev.map((s) => (s.id === resetTarget.id ? { ...s, password: data.password } : s))
      );
      setCredentials({
        name: resetTarget.name,
        loginId: resetTarget.loginId,
        password: data.password,
      });
      setResetTarget(null);
    } catch {
      setResetError("Network error, please try again");
    } finally {
      setResetBusy(false);
    }
  }

  async function handleDelete(student: StudentRow) {
    setBusyId(student.id);
    try {
      const res = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
      }
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Student name" htmlFor="studentName">
              <Input
                id="studentName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
              />
            </Field>
          </div>
          <Field label="Section" htmlFor="studentSection">
            <select
              id="studentSection"
              value={section}
              onChange={(e) => setSection(e.target.value as Section)}
              className="min-h-11 rounded-xl border border-border bg-card px-3.5 py-2.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </Field>
          <Button type="submit" disabled={adding || !name.trim()}>
            {adding ? "Adding…" : "Add student"}
          </Button>
        </form>
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {(["ALL", "A", "B"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSectionFilter(s)}
              className={`min-h-9 cursor-pointer rounded-lg border px-3 text-xs font-semibold transition-colors ${
                sectionFilter === s
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {s === "ALL" ? "All" : `Section ${s}`}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {students.length}
        </span>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Section</th>
              <th className="px-5 py-3 font-semibold">Login ID</th>
              <th className="px-5 py-3 font-semibold">Password</th>
              <th className="px-5 py-3 font-semibold">Submissions</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  {students.length === 0
                    ? "No students yet. Add your first one above."
                    : "No students match that search."}
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{student.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">Section {student.section}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {student.loginId}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {student.password ? (
                      <button
                        type="button"
                        onClick={() => toggleReveal(student.id)}
                        className="cursor-pointer underline decoration-dotted underline-offset-2 hover:text-foreground"
                      >
                        {revealed.has(student.id) ? student.password : "••••••"}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{student.submissionCount}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === student.id}
                        onClick={() => openResetModal(student)}
                        className="min-h-9 cursor-pointer rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                      >
                        Reset password
                      </button>
                      <button
                        type="button"
                        disabled={busyId === student.id}
                        onClick={() => setConfirmDelete(student)}
                        className="min-h-9 cursor-pointer rounded-lg border border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {resetTarget && (
        <Modal title="Reset password" onClose={() => setResetTarget(null)}>
          <p className="mb-4 text-sm text-muted-foreground">
            Set a new password for <strong>{resetTarget.name}</strong>. Type your own, or use the
            suggested one.
          </p>
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <Field label="New password" htmlFor="resetPassword" required>
              <div className="flex gap-2">
                <Input
                  id="resetPassword"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setResetPassword(suggestPassword())}
                  className="min-h-11 shrink-0 cursor-pointer rounded-xl border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Suggest
                </button>
              </div>
            </Field>
            {resetError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {resetError}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setResetTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={resetBusy}>
                {resetBusy ? "Saving…" : "Save password"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {credentials && (
        <Modal title="Login credentials" onClose={() => setCredentials(null)}>
          <p className="mb-4 text-sm text-muted-foreground">
            Share these with <strong>{credentials.name}</strong>. The password won&apos;t be shown again.
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Login ID</p>
              <code className="mt-1 block rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                {credentials.loginId}
              </code>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Password</p>
              <code className="mt-1 block rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                {credentials.password}
              </code>
            </div>
          </div>
          <Button className="mt-5 w-full" onClick={() => setCredentials(null)}>
            Done
          </Button>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete student?" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-muted-foreground">
            This will permanently delete <strong>{confirmDelete.name}</strong>
            {confirmDelete.submissionCount > 0 && (
              <> and their {confirmDelete.submissionCount} submitted photo
              {confirmDelete.submissionCount === 1 ? "" : "s"}</>
            )}
            . This can&apos;t be undone.
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={busyId === confirmDelete.id}
              onClick={() => handleDelete(confirmDelete)}
            >
              {busyId === confirmDelete.id ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
