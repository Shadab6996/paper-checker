import { Suspense } from "react";
import Link from "next/link";
import { GlowCard } from "@/components/GlowCard";
import { LoginForm } from "@/components/LoginForm";

const DARK_THEME_VARS = {
  "--color-card": "#0d111799",
  "--color-card-foreground": "#e2e8f0",
  "--color-border": "#ffffff33",
  "--color-foreground": "#e2e8f0",
  "--color-muted-foreground": "#94a3b8",
  "--color-primary": "#5ec8ff",
  "--color-primary-hover": "#7dd4ff",
  "--color-on-primary": "#03050a",
  "--color-destructive": "#fb2c36",
  "--color-ring": "#5ec8ff",
} as React.CSSProperties;

export default function MsLoginPage() {
  return (
    <div
      className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4"
      style={{ background: "#03050a" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#5ec8ff1f 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Link
        href="/login"
        className="absolute left-5 top-5 z-10 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/40 backdrop-blur-xl transition-colors hover:text-[#7dd4ff]"
      >
        ← Back
      </Link>

      <GlowCard className="relative w-full max-w-sm animate-fade-in-up rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
            style={{ background: "linear-gradient(135deg, #5ec8ff 0%, #a78bfa 100%)" }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#03050a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-white">MS-login</h1>
          <p className="text-sm text-white/40">Admin access only.</p>
        </div>

        <div style={DARK_THEME_VARS}>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </GlowCard>
    </div>
  );
}
