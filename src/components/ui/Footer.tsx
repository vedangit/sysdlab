"use client";

import Link from "next/link";
import { useLessonFeedbackPrompt } from "@/components/providers/LessonFeedbackProvider";

export function Footer() {
  const { openInterestPrompt } = useLessonFeedbackPrompt();

  return (
    <footer className="mt-auto w-full border-t border-zinc-800 bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-sm font-bold tracking-tight text-zinc-200">
            SYSTEM_DESIGN_LAB
          </span>
          <p className="max-w-md text-xs leading-6 text-zinc-600">
            Initial release, built to make low-level design feel hands-on. More lessons, more labs,
            and better interview practice are on the way.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="hidden items-center gap-2 rounded-sm border border-zinc-800/60 bg-zinc-900/50 px-3 py-1.5 md:flex">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Cluster Operational
            </span>
          </div>

          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Feedback / updates
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              className="font-mono text-xs uppercase tracking-wide text-zinc-500 transition-colors hover:text-zinc-200"
            >
              GitHub
            </Link>
            <button
              type="button"
              onClick={() =>
                openInterestPrompt({
                  lessonHref: null,
                  lessonTitle: "the platform",
                  headline: "Interested in updates?",
                  description:
                    "If you want to follow along as the platform grows, leave your email and we’ll only send the useful stuff.",
                })
              }
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              I&apos;m interested in further updates.
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
