"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { courseCatalog, type CourseId } from "@/lib/course-catalog";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";

type CourseSidebarProps = {
  courseId: CourseId;
};

export function CourseSidebar({ courseId }: CourseSidebarProps) {
  const pathname = usePathname();
  const { completedLessonCount, totalLessonCount, isLessonComplete, toggleLesson } =
    useCourseProgress();

  const course = courseCatalog[courseId];

  return (
    <aside className="hidden lg:block w-72 shrink-0 border-r border-zinc-800/50 min-h-[calc(100vh-4rem)] pt-10 pr-6">
      <div className="sticky top-10">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
          {course.title}
        </span>

        <div className="mb-5 border border-zinc-800 bg-[#101010] px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Progress
          </div>
          <div className="mt-2 text-sm text-zinc-200">
            {completedLessonCount(courseId)} / {totalLessonCount(courseId)} lessons
          </div>
        </div>

        <nav className="flex flex-col gap-5">
          {course.tracks.map((track) => {
            const activeTrack = pathname.startsWith(track.href);
            const completedLessons = completedLessonCount(courseId, track.id);
            const totalLessons = totalLessonCount(courseId, track.id);

            return (
              <div key={track.id} className="space-y-2">
                <Link
                  href={track.href}
                  className={`block border-l-2 pl-3 py-1.5 font-mono text-sm transition-colors ${
                    activeTrack
                      ? "border-amber-500 text-amber-300"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-600">
                    {track.badge}
                  </span>
                  {track.title}
                </Link>

                <div className="space-y-1">
                  {track.lessons.map((lesson) => {
                    const completed = isLessonComplete(courseId, lesson.href);
                    const activeLesson = pathname === lesson.href;

                    return (
                      <div
                        key={lesson.href}
                        className={`flex items-center gap-2 rounded-sm border px-2 py-1.5 text-sm ${
                          activeLesson
                            ? "border-amber-500/30 bg-amber-500/5"
                            : "border-transparent"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleLesson(courseId, lesson.href)}
                          className={`flex h-5 w-5 items-center justify-center border text-[11px] transition-colors ${
                            completed
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : "border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-300"
                          }`}
                          aria-label={`Toggle ${lesson.title}`}
                        >
                          {completed ? "✓" : ""}
                        </button>
                        <Link
                          href={lesson.href}
                          className={`min-w-0 flex-1 truncate font-mono text-xs transition-colors ${
                            completed ? "text-zinc-300" : "text-zinc-500 hover:text-zinc-200"
                          }`}
                        >
                          {lesson.order.toString().padStart(2, "0")}. {lesson.title}
                        </Link>
                      </div>
                    );
                  })}
                </div>

                <div className="pl-3 text-[10px] uppercase tracking-widest text-zinc-600">
                  {completedLessons}/{totalLessons} complete
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
