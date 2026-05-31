import Link from "next/link";

const lessons = [
  {
    href: "/lld/design-principles/extensible-systems",
    index: "01",
    title: "Extensible Systems",
    body: "SRP and OCP keep responsibilities narrow and extension points explicit.",
    tags: ["SRP", "OCP", "Strategy"],
  },
  {
    href: "/lld/design-principles/robust-contracts",
    index: "02",
    title: "Robust Contracts",
    body: "LSP, ISP, and DIP make hierarchies honest and dependencies testable.",
    tags: ["LSP", "ISP", "DIP"],
  },
  {
    href: "/lld/design-principles/minimalist-architecture",
    index: "03",
    title: "Minimalist Architecture",
    body: "DRY, KISS, and YAGNI keep the codebase small, direct, and easy to change.",
    tags: ["DRY", "KISS", "YAGNI"],
  },
];

export default function DesignPrinciplesIndexPage() {
  return (
    <div className="not-prose">
      <section className="mb-10 border border-zinc-800 bg-[#101010]">
        <div className="border-b border-zinc-800 bg-zinc-950 px-5 py-3 font-mono text-xs uppercase tracking-widest text-amber-500/80">
          Object-Oriented Design Principles
        </div>
        <div className="p-6 md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Refactoring-oriented labs
          </div>
          <h1 className="m-0 max-w-3xl text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
            Design principles as working constraints, not slogans
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
            Each lesson pairs a compact note set with an engine-driven exercise
            that detects coupling, unsafe hierarchies, and unnecessary complexity.
          </p>
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
                  Module {lesson.index}
                </div>
                <h2 className="m-0 text-lg font-semibold text-zinc-100 transition-colors group-hover:text-amber-400">
                  {lesson.title}
                </h2>
                <p className="m-0 mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  {lesson.body}
                </p>
              </div>
              <span className="shrink-0 border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500 group-hover:border-amber-500/30 group-hover:text-amber-400">
                Open Lab
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {lesson.tags.map((tag) => (
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
