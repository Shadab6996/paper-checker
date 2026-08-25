const features = [
  {
    title: "Snap & submit",
    body: "Photograph your answer sheet and turn it in straight from your phone.",
    icon: (
      <path d="M4 8a2 2 0 0 1 2-2h1.2a2 2 0 0 0 1.664-.89l.272-.41A2 2 0 0 1 10.8 4h2.4a2 2 0 0 1 1.664.89l.272.41A2 2 0 0 0 16.8 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    ),
    circle: true,
  },
  {
    title: "One link per test",
    body: "Your teacher shares a link — open it, and you're already on the right test.",
    icon: <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />,
  },
  {
    title: "Nothing to lose",
    body: "Once it's turned in, it's saved — your teacher can find it anytime.",
    icon: <path d="M9 12l2 2 4-4m5 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  },
];

export function HeroPanel() {
  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden bg-primary px-6 py-10 text-on-primary sm:px-12 sm:py-16 lg:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-on-primary/10 blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent/20 blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
      />

      <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-widest text-on-primary/70">
          Paper Checker
        </p>
        <h1 className="mt-3 max-w-md text-4xl font-extrabold leading-tight sm:text-5xl">
          Turn in your test in seconds.
        </h1>
        <p className="mt-4 max-w-sm text-base text-on-primary/85">
          No app to install, no papers to lose. Log in, open your test link, snap a
          photo, and you&apos;re done.
        </p>

        <ul className="mt-10 hidden flex-col gap-5 sm:flex">
          {features.map((f) => (
            <li key={f.title} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-on-primary/15`}
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {f.icon}
                  {f.circle && <circle cx="12" cy="12.5" r="3.5" />}
                </svg>
              </span>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-on-primary/75">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
