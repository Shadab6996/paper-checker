"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import HeroFigure from "./hero/HeroFigure";
import Rocket from "./hero/Rocket";

const HeroScene = dynamic(() => import("./hero/HeroScene"), { ssr: false });

type Theme = "night" | "day";

const SKY: Record<Theme, string> = {
  night: "#03050a",
  day: "linear-gradient(180deg, #4fa8e8 0%, #8ecdfb 45%, #ffe3b0 100%)",
};

const DEFAULT_QUOTE = "The best answer sheet is the one that actually gets submitted.";

export function HeroPanel({
  studentNames = [],
  quote = DEFAULT_QUOTE,
}: {
  studentNames?: string[];
  quote?: string;
}) {
  const [theme, setTheme] = useState<Theme>("night");
  const isDay = theme === "day";

  const pillClass = isDay
    ? "border-black/10 bg-black/5 text-slate-500 hover:text-orange-500"
    : "border-white/10 bg-white/5 text-white/35 hover:text-[#7dd4ff]";

  return (
    <div
      className="relative flex h-full min-h-[640px] flex-col overflow-hidden transition-[background] duration-700"
      style={{ background: SKY[theme] }}
    >
      <HeroScene theme={theme} topNames={studentNames} />
      <HeroFigure sizeClassName="h-[30vh] w-auto max-h-[300px] object-contain object-bottom opacity-90 drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]" />
      <Rocket />

      <button
        type="button"
        onClick={() => setTheme(isDay ? "night" : "day")}
        aria-label="Toggle day/night"
        className={`absolute left-5 top-5 z-10 cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium backdrop-blur-xl transition-colors ${pillClass}`}
      >
        {isDay ? "Day" : "Night"}
      </button>

      <Link
        href="/ms-login"
        className={`absolute right-5 top-5 z-10 rounded-lg border px-2.5 py-1 text-xs font-medium backdrop-blur-xl transition-colors ${pillClass}`}
      >
        MS-login
      </Link>

      <div className="pointer-events-none relative z-10 px-6 pt-16 sm:px-12 sm:pt-20 lg:px-16">
        <h1
          className={`mt-3 max-w-md text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl ${
            isDay ? "text-slate-900" : "text-white"
          }`}
        >
          Turn in your test
        </h1>
        <h1
          className={`max-w-md text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl ${
            isDay ? "text-slate-900/25" : "text-white/25"
          }`}
        >
          in seconds.
        </h1>

        <p
          className={`mt-6 max-w-sm text-base font-light italic leading-relaxed ${
            isDay ? "text-slate-600" : "text-white/50"
          }`}
        >
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
