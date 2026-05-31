"use client";

import Link from "next/link";
import { courseCatalog } from "@/lib/course-catalog";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";

type DatabaseOverviewProps = {
  href?: string;
  ctaLabel?: string;
};

export function DatabaseOverview({
  href = "/databases",
  ctaLabel = "Open module",
}: DatabaseOverviewProps) {
  const { completedLessonCount, totalLessonCount, isLessonComplete } = useCourseProgress();
  const course = courseCatalog.databases;
  const track = course.tracks[0];
  const completed = completedLessonCount("databases", track.id);
  const total = totalLessonCount("databases", track.id);
  const done = completed === total && total > 0;

  return (
    <Link
      href={href}
      className="group block border border-zinc-800 bg-[#151515] p-5 rounded-sm hover:border-zinc-600 transition-colors duration-200"
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <div>
          <h3 className="text-lg text-zinc-200 font-semibold group-hover:text-amber-400 transition-colors">
            02. Databases
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            A single curriculum for persistence, transactions, isolation, and scaling. The course
            opens with why databases exist, then walks through relational basics, ACID, and the
            path to replication and sharding.
          </p>
        </div>
        <span
          className={`shrink-0 border px-2 py-1 text-[10px] uppercase tracking-wider ${
            done
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-zinc-800 bg-zinc-800 text-zinc-400"
          }`}
        >
          {done ? "✓ Complete" : `${completed}/${total}`}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {track.lessons.map((lesson) => (
          <span
            key={lesson.href}
            className={`border px-2 py-1 text-[10px] uppercase tracking-wider ${
              isLessonComplete("databases", lesson.href)
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-800 bg-zinc-950 text-zinc-500"
            }`}
          >
            {isLessonComplete("databases", lesson.href)
              ? "✓"
              : lesson.order.toString().padStart(2, "0")}
          </span>
        ))}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden bg-zinc-900">
        <div
          className="h-full bg-amber-400/70 transition-all"
          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
        />
      </div>
      <div className="mt-4 text-[10px] uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">
        {ctaLabel}
      </div>
    </Link>
  );
}
