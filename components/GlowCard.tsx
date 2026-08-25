"use client";

export function GlowCard({
  className = "",
  children,
  as: Component = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "li" | "form";
}) {
  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  return (
    <Component
      onMouseMove={handleMouseMove}
      className={`glow-card relative overflow-hidden ${className}`}
    >
      <div className="glow-card-border pointer-events-none absolute inset-0 rounded-[inherit]" />
      <div className="glow-card-sheen pointer-events-none absolute inset-0 rounded-[inherit]" />
      {children}
    </Component>
  );
}
