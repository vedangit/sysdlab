import Link from "next/link";

const lessons = [
  {
    href: "/lld/oop/instance-initialization",
    index: "01",
    title: "01. Instance Initialization",
    body: "Object allocation, constructor paths, copy lifecycles, singleton guards, and the implicit current-object reference.",
    tags: ["Heap", "this", "Constructors"],
  },
  {
    href: "/lld/oop/runtime-dispatch",
    index: "02",
    title: "02. Runtime Dispatch",
    body: "Overloading, overriding, vtable routing, inheritance topology, and structural relationships between classes.",
    tags: ["Vtable", "Override", "UML"],
  },
  {
    href: "/lld/oop/encapsulation-abstraction",
    index: "03",
    title: "03. Encapsulation & Abstraction",
    body: "Visibility boundaries, invariant protection, abstract classes, interfaces, and default-method conflict resolution.",
    tags: ["Access", "Contracts", "State"],
  },
  {
    href: "/lld/oop/generics",
    index: "04",
    title: "04. Parameterized Polymorphism",
    body: "Generics, type erasure, wildcard variance, and type-safe reusable containers.",
    tags: ["Erasure", "Bounds", "Variance"],
  },
];

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
            Object-Oriented Programming, from heap layout to type bounds
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
            This series treats OOP as runtime architecture, not just syntax.
            Each lesson connects language constructs to memory allocation,
            dispatch tables, visibility boundaries, and compile-time contracts.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-5 font-mono text-xs text-zinc-500 sm:grid-cols-3">
            <div>
              <span className="block text-zinc-300">08 labs</span>
              Engine-checked exercises
            </div>
            <div>
              <span className="block text-zinc-300">04 lessons</span>
              Constructor to generics path
            </div>
            <div>
              <span className="block text-zinc-300">Java model</span>
              OOP mechanics, not trivia
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
