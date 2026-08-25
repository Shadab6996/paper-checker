export function Footer({ className = "" }: { className?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className={`py-6 text-center text-xs text-muted-foreground ${className}`}>
      © {year} Paper Checker. All rights reserved to msrahi.
    </footer>
  );
}
