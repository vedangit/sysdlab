import Link from "next/link";

const tracks = [
  {
    href: "/lld/oop",
    title: "Object-Oriented Programming",
    body: "Classes, constructors, runtime dispatch, encapsulation, and generics with memory-level labs.",
    tags: ["Heap", "Dispatch", "Types"],
  },
  {
    href: "/lld/design-principles",
    title: "Design Principles",
    body: "SRP, OCP, LSP, ISP, DIP, DRY, KISS, and YAGNI through refactoring-focused inspections.",
    tags: ["SRP", "DIP", "YAGNI"],
  },
];

export default function LldIndexPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-zinc-300 font-mono p-6 md:p-16 selection:bg-amber-500/30 selection:text-amber-200">
      <header className="mb-16 border-b border-zinc-800 pb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">
          Low Level Design
        </h1>
        <p className="text-zinc-500 text-sm">
          A practical series on object models, design rules, and the architecture
          choices that keep systems easy to extend and hard to break.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-zinc-800 flex-grow" />
            <h2 className="text-amber-500 uppercase tracking-widest text-xs font-semibold">
              Available Tracks
            </h2>
            <div className="h-px bg-zinc-800 flex-grow" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tracks.map((track) => (
              <Link
                key={track.href}
                href={track.href}
                className="group block border border-zinc-800 bg-[#151515] p-5 rounded-sm hover:border-zinc-600 transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg text-zinc-200 font-semibold group-hover:text-amber-400 transition-colors">
                    {track.title}
                  </h3>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 uppercase tracking-wider">
                    Interactive Series
                  </span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  {track.body}
                </p>
                <div className="flex gap-2">
                  {track.tags.map((tag) => (
                    <span key={tag} className="text-xs text-zinc-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
