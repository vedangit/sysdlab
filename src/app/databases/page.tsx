import { DatabaseOverview } from "@/components/ui/DatabaseOverview";
import { ComingSoonCard } from "@/components/ui/ComingSoonCard";

export default function DatabasesIndexPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-zinc-300 font-mono p-6 md:p-16 selection:bg-amber-500/30 selection:text-amber-200">
      <header className="mb-16 border-b border-zinc-800 pb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">Databases</h1>
        <p className="text-zinc-500 text-sm">
          A guided series on persistence, relational modeling, isolation, and scaling, with
          completion ticks that carry across the whole module.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-zinc-800 flex-grow" />
            <h2 className="text-amber-500 uppercase tracking-widest text-xs font-semibold">
              Available Track
            </h2>
            <div className="h-px bg-zinc-800 flex-grow" />
          </div>

          <DatabaseOverview href="/databases/whydb" ctaLabel="Start with Why Databases Exist" />
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-grow bg-zinc-800" />
            <h2 className="text-amber-500 uppercase tracking-widest text-xs font-semibold">
              Coming Soon Track
            </h2>
            <div className="h-px flex-grow bg-zinc-800" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ComingSoonCard
              title="NoSQL"
              description="Document stores, key-value stores, and the trade-offs that show up once the relational model is no longer enough."
              badges={["Mongo-style", "Key-Value", "Distributed"]}
              lockLabel="Locked"
            />
            <ComingSoonCard
              title="Interview Questions"
              description="A curated set of database design prompts with a visible lock badge until the track is released."
              badges={["Locked", "Practice", "Simulations"]}
              lockLabel="🔒 Interview"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
