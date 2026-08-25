export default function Rocket() {
  return (
    <div
      aria-hidden
      className="animate-rocket-fly pointer-events-none absolute left-0 top-[22%] z-[4]"
    >
      <svg width="70" height="26" viewBox="0 0 70 26" fill="none">
        {/* exhaust trail (points left, since travel direction is right-to-left) */}
        <path
          d="M40 13 L70 6 L64 13 L70 20 Z"
          fill="url(#rocket-flame)"
          opacity="0.85"
        />
        {/* body */}
        <g>
          <path
            d="M40 13 C40 7 30 3 18 3 C10 3 4 7 4 13 C4 19 10 23 18 23 C30 23 40 19 40 13 Z"
            fill="#e9edf5"
            stroke="#9aa3b5"
            strokeWidth="1"
          />
          <circle cx="16" cy="13" r="4" fill="#5ec8ff" stroke="#2b6ea8" strokeWidth="0.75" />
          <path d="M4 13 C4 9 7 6 12 5 L9 13 L12 21 C7 20 4 17 4 13 Z" fill="#c7ccd6" />
        </g>
        <defs>
          <linearGradient id="rocket-flame" x1="40" y1="13" x2="70" y2="13" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffd76a" />
            <stop offset="0.5" stopColor="#ff9a4d" />
            <stop offset="1" stopColor="#ff9a4d" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
