"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      const redirect = searchParams.get("redirect");
      const fallback = data.role === "ADMIN" ? "/admin" : "/dashboard";
      router.push(redirect || fallback);
      router.refresh();
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field label="Login ID" htmlFor="loginId" required>
        <Input
          id="loginId"
          name="loginId"
          autoComplete="username"
          autoFocus
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          required
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 min-h-9 px-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </Field>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
