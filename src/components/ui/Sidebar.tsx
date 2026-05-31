"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { courseCatalog } from "@/lib/course-catalog";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";

export function Sidebar() {
  const pathname = usePathname();
  const { completedLessonCount, totalLessonCount, isLessonComplete, toggleLesson } =
    useCourseProgress();
  const course = courseCatalog.databases;
  const track = course.tracks[0];
  const completed = completedLessonCount("databases", track.id);
  const total = totalLessonCount("databases", track.id);

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-zinc-800/50 min-h-[calc(100vh-4rem)] pt-10 pr-6">
      <div className="sticky top-10">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
          {course.title}
        </span>

        <div className="mb-5 border border-zinc-800 bg-[#101010] px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Progress</div>
          <div className="mt-2 text-sm text-zinc-200">
            {completed} / {total} lessons
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {track.lessons.map((link) => {
            const isActive = pathname === link.href;
            return (
              <div key={link.href} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleLesson("databases", link.href)}
                  aria-label={`Toggle ${link.title}`}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] transition-colors ${
                    isLessonComplete("databases", link.href)
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-700 text-zinc-600"
                  }`}
                >
                  {isLessonComplete("databases", link.href) ? "✓" : link.order}
                </button>
                <Link
                  href={link.href}
                  className={`min-w-0 flex-1 text-sm font-mono py-1.5 transition-colors border-l-2 pl-3 ${
                    isActive
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {link.order.toString().padStart(2, "0")}. {link.title}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
