"use client";

import Link from "next/link";
import { courseCatalog } from "@/lib/course-catalog";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";

export function LldOverview() {
  const { completedLessonCount, totalLessonCount, isLessonComplete } = useCourseProgress();
  const course = courseCatalog.lld;

  return (
    <div className="grid grid-cols-1 gap-4">
      {course.tracks.map((track) => {
        const completed = completedLessonCount("lld", track.id);
        const total = totalLessonCount("lld", track.id);
        const done = completed === total && total > 0;

        return (
          <Link
            key={track.href}
            href={track.href}
            className="group block border border-zinc-800 bg-[#151515] p-5 rounded-sm hover:border-zinc-600 transition-colors duration-200"
          >
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                <h3 className="text-lg text-zinc-200 font-semibold group-hover:text-amber-400 transition-colors">
                  {track.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  {track.summary}
                </p>
              </div>
              <span className={`shrink-0 border px-2 py-1 text-[10px] uppercase tracking-wider ${
                done
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-800 bg-zinc-800 text-zinc-400"
              }`}>
                {done ? "✓ Complete" : `${completed}/${total}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {track.lessons.map((lesson) => (
                <span
                  key={lesson.href}
                  className={`border px-2 py-1 text-[10px] uppercase tracking-wider ${
                    isLessonComplete("lld", lesson.href)
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-500"
                  }`}
                >
                  {isLessonComplete("lld", lesson.href)
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
          </Link>
        );
      })}
    </div>
  );
}
