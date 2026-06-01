"use client";

import Link from "next/link";
import { courseCatalog } from "@/lib/course-catalog";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

export default function ProfilePage() {
  const { session, isConfigured, isReady, signOut } = useSupabaseAuth();
  const { openOptional } = useAuthModal();
  const { completedLessonCount, totalLessonCount, isLessonComplete } = useCourseProgress();

  const email = session?.user?.email ?? "";
  const avatar = email ? email[0]?.toUpperCase() ?? "U" : "U";
  const courses = Object.values(courseCatalog);
  const isSignedIn = Boolean(session?.user);
  const nextLesson =
    courses
      .flatMap((course) =>
        course.tracks.flatMap((track) =>
          track.lessons.map((lesson) => ({
            courseId: course.id,
            courseTitle: course.title,
            trackTitle: track.title,
            lesson,
          })),
        ),
      )
      .find(({ courseId, lesson }) => !isLessonComplete(courseId, lesson.href)) ?? null;
  const totalCompleted = courses.reduce(
    (sum, course) => sum + completedLessonCount(course.id),
    0,
  );
  const totalLessons = courses.reduce((sum, course) => sum + totalLessonCount(course.id), 0);
  const completionPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#111111] text-zinc-300 font-mono p-6 md:p-16 selection:bg-amber-500/30 selection:text-amber-200">
      <header className="mb-12 border-b border-zinc-800 pb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">Profile</h1>
        <p className="text-zinc-500 text-sm">
          Track your progress, review the courses you’ve completed, and keep your local work in
          sync when you’re signed in.
        </p>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-zinc-800 bg-[#151515] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-lg font-semibold text-emerald-300">
                {avatar}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Account
                </div>
                <h2 className="mt-1 truncate text-lg font-semibold text-zinc-100">
                  {isSignedIn ? email : "Anonymous session"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {isSignedIn
                    ? `Signed in with ${session?.user?.app_metadata?.provider ?? "Supabase auth"}`
                    : "Your progress is stored locally until you sign in."}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {!isConfigured ? (
                <span className="border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs uppercase tracking-wider text-zinc-500">
                  Auth setup pending
                </span>
              ) : !isSignedIn ? (
                <button
                  type="button"
                  onClick={openOptional}
                  className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
                >
                  Sign in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={signOut}
                  className="border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                >
                  Log out
                </button>
              )}
              <span className="border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs uppercase tracking-wider text-zinc-500">
                {isReady ? "Progress ready" : "Loading progress"}
              </span>
              <span className="border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs uppercase tracking-wider text-zinc-500">
                {isConfigured ? "Auth configured" : "Auth not configured"}
              </span>
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#151515] p-5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Summary</div>
            <div className="mt-3 h-1.5 overflow-hidden bg-zinc-900">
              <div
                className="h-full bg-emerald-500/70 transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              {totalCompleted === 0
                ? "No lessons are completed yet — open a course to start collecting ticks."
                : `${totalCompleted} lessons complete across the whole lab.`}
            </p>
            <div className="mt-4 space-y-4">
              {courses.map((course) => {
                const total = totalLessonCount(course.id);
                const completed = completedLessonCount(course.id);
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div key={course.id} className="border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-200">{course.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                          {course.id === "lld"
                            ? "Object models and design principles."
                            : "Why databases exist and how they scale."}
                        </p>
                      </div>
                      <span className="border border-zinc-800 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
                        {completed}/{total}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden bg-zinc-900">
                      <div
                        className="h-full bg-emerald-500/70 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <h2 className="text-amber-500 uppercase tracking-widest text-xs font-semibold">
              Lesson Progress
            </h2>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="grid gap-4">
            <div className="border border-zinc-800 bg-[#151515] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Continue learning
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-zinc-100">
                    {nextLesson ? nextLesson.lesson.title : "Everything is complete"}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                    {nextLesson
                      ? `${nextLesson.courseTitle} · ${nextLesson.trackTitle}`
                      : "Nice work — all lessons are marked complete in your local progress."}
                  </p>
                </div>
                {nextLesson ? (
                  <Link
                    href={nextLesson.lesson.href}
                    className="text-xs uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300"
                  >
                    Open next lesson
                  </Link>
                ) : null}
              </div>
            </div>

            {courses.map((course) => (
              <div key={course.id} className="border border-zinc-800 bg-[#151515] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">{course.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {course.tracks.map((track) => track.title).join(" • ")}
                    </p>
                  </div>
                  <Link
                    href={course.id === "lld" ? "/lld" : "/databases"}
                    className="text-xs uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300"
                  >
                    Open course
                  </Link>
                </div>

                <div className="mt-5 space-y-4">
                  {course.tracks.map((track) => {
                    const trackCompleted = completedLessonCount(course.id, track.id);
                    const trackTotal = totalLessonCount(course.id, track.id);

                    return (
                      <div key={track.id} className="border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-zinc-200">{track.title}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                              {track.summary}
                            </p>
                          </div>
                          <span className="border border-zinc-800 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
                            {trackCompleted}/{trackTotal}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {track.lessons.map((lesson) => (
                            <span
                              key={lesson.href}
                              className={`border px-2 py-1 text-[10px] uppercase tracking-wider ${
                                isLessonComplete(course.id, lesson.href)
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-zinc-800 bg-zinc-900 text-zinc-500"
                              }`}
                            >
                              {isLessonComplete(course.id, lesson.href)
                                ? "✓"
                                : lesson.order.toString().padStart(2, "0")}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
