import Link from "next/link";
import { courseCatalog } from "@/lib/course-catalog";

const lessons = courseCatalog.lld.tracks.find((track) => track.id === "oop")?.lessons ?? [];
const labCount = lessons.reduce((total, lesson) => total + lesson.labs.length, 0);

export default function OopIndexPage() {
  return (
    <div className="not-prose">
      <section className="mb-10 border border-zinc-800 bg-[#101010]">
        <div className="border-b border-zinc-800 bg-zinc-950 px-5 py-3 font-mono text-xs uppercase tracking-widest text-amber-500/80">
          Low Level Design Series
        </div>
        <div className="p-6 md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Interactive runtime notes
          </div>
          <h1 className="m-0 max-w-3xl text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
            Object-Oriented Programming, from object identity to type bounds
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
            This series starts with the object model, then builds upward through
            construction, dispatch, encapsulation, and type-safe reuse.
            Each lesson connects language constructs to memory allocation,
            runtime behavior, and compile-time contracts.
          </p>
          <div className="mt-5 max-w-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-7 text-zinc-400">
            <span className="block text-[10px] uppercase tracking-widest text-amber-500/80">
              Study note
            </span>
            The labs use a pattern-based engine, not a real compiler. That is deliberate: the goal
            is to train the design intuition and mental model first, then make the code look right
            in the context of the lesson.
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-5 font-mono text-xs text-zinc-500 sm:grid-cols-3">
            <div>
              <span className="block text-zinc-300">{String(labCount).padStart(2, "0")} labs</span>
              Engine-checked exercises
            </div>
            <div>
              <span className="block text-zinc-300">{String(lessons.length).padStart(2, "0")} lessons</span>
              Identity to generics path
            </div>
            <div>
              <span className="block text-zinc-300">OOP mechanics</span>
              From identity to generics
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <h2 className="m-0 font-mono text-xs font-semibold uppercase tracking-widest text-amber-500">
          Lesson Path
        </h2>
        <div className="h-px flex-1 bg-zinc-800" />
      </section>

      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <Link
            key={lesson.href}
            href={lesson.href}
            className="group block border border-zinc-800 bg-[#151515] p-5 text-zinc-300 transition-colors hover:border-amber-500/50"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-600 group-hover:text-amber-500/70">
                  Module {lesson.order.toString().padStart(2, "0")}
                </div>
                <h2 className="m-0 text-lg font-semibold text-zinc-100 transition-colors group-hover:text-amber-400">
                  {lesson.title}
                </h2>
                <p className="m-0 mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  {lesson.summary}
                </p>
              </div>
              <span className="shrink-0 border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500 group-hover:border-amber-500/30 group-hover:text-amber-400">
                Open Lab
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {lesson.labs.map((tag) => (
                <span key={tag} className="font-mono text-xs text-zinc-500">
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
