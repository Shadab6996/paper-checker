import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover disabled:bg-primary/50",
  secondary:
    "bg-card text-foreground border border-border hover:bg-muted disabled:opacity-50",
  danger:
    "bg-destructive text-on-destructive hover:bg-destructive-hover disabled:opacity-50",
  ghost: "text-foreground hover:bg-muted disabled:opacity-50",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 min-h-11 text-sm font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
});
