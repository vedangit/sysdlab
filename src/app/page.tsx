"use client";

import Link from "next/link";
import { courseCatalog } from "@/lib/course-catalog";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";
import { DatabaseOverview } from "@/components/ui/DatabaseOverview";

export default function Home() {
  const { completedLessonCount, totalLessonCount } = useCourseProgress();
  const lldCourse = courseCatalog.lld;
  const lldCompleted = completedLessonCount("lld");
  const lldTotal = totalLessonCount("lld");
  const lldProgress = lldTotal > 0 ? Math.round((lldCompleted / lldTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#111111] text-zinc-300 font-mono p-6 md:p-16 selection:bg-amber-500/30 selection:text-amber-200">
      <header className="mb-16 border-b border-zinc-800 pb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">
          System Design Lab
        </h1>
        <p className="text-zinc-500 text-sm">
          Interactive execution environments for distributed systems, database internals, and architecture patterns. All labs run client-side via WASM.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-zinc-800 flex-grow"></div>
            <h2 className="text-amber-500 uppercase tracking-widest text-xs font-semibold">
              Available Modules
            </h2>
            <div className="h-px bg-zinc-800 flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/lld"
              className="group block border border-zinc-800 bg-[#151515] p-5 rounded-sm hover:border-zinc-600 transition-colors duration-200"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <h3 className="text-lg text-zinc-200 font-semibold group-hover:text-amber-400 transition-colors">
                    01. Low Level Design
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Explore OOP internals and design principles through engine-driven lessons that
                    connect memory layout, contracts, and refactoring.
                  </p>
                </div>
                <span className="shrink-0 border border-zinc-800 bg-zinc-800 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
                  Interactive Series
                </span>
              </div>

              <div className="space-y-3">
                <div className="h-1.5 overflow-hidden bg-zinc-900">
                  <div
                    className="h-full bg-amber-400/70 transition-all"
                    style={{ width: `${lldProgress}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {lldCourse.tracks.map((track) => {
                    const completed = completedLessonCount("lld", track.id);
                    const total = totalLessonCount("lld", track.id);

                    return (
                      <span
                        key={track.href}
                        className="border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500"
                      >
                        {track.title} · {completed}/{total}
                      </span>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <span className="text-xs text-zinc-500">#LLD</span>
                  <span className="text-xs text-zinc-500">#OOP</span>
                  <span className="text-xs text-zinc-500">#Principles</span>
                </div>
              </div>
            </Link>

            <DatabaseOverview />
          </div>
        </section>
      </main>
    </div>
  );
}
