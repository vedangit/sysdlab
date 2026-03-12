import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111111] text-zinc-300 font-mono p-6 md:p-16 selection:bg-amber-500/30 selection:text-amber-200">
      <header className="mb-16 border-b border-zinc-800 pb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">
          System Design Lab
        </h1>
        <p className="text-zinc-500 text-sm">
          Interactive execution environments for distributed systems, database internals, and architecture patterns. All labs run client-side via WASM.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-zinc-800 flex-grow"></div>
            <h2 className="text-amber-500 uppercase tracking-widest text-xs font-semibold">
              Available Modules
            </h2>
            <div className="h-px bg-zinc-800 flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Module Card: Isolation Levels */}
            <Link 
              href="/databases/whydb" 
              className="group block border border-zinc-800 bg-[#151515] p-5 rounded-sm hover:border-zinc-600 transition-colors duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg text-zinc-200 font-semibold group-hover:text-amber-400 transition-colors">
                  01. Why do we need Databases? An obvious guide.
                </h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Interactive Demo
                </span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Why do need something like a database? What's up with data even? Why is it so important? Answers to these and many other obvious questions you may be afraid to ask.
              </p>
              <div className="flex gap-2">
                <span className="text-xs text-zinc-500">#Database</span>
                <span className="text-xs text-zinc-500">#Relational Database</span>
                <span className="text-xs text-zinc-500">#Postgres</span>
              </div>
            </Link>
            <Link 
              href="/databases/relationaldbs" 
              className="group block border border-zinc-800 bg-[#151515] p-5 rounded-sm hover:border-zinc-600 transition-colors duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg text-zinc-200 font-semibold group-hover:text-amber-400 transition-colors">
                  02. Relational Databases: ACID
                </h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Interactive Lab
                </span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                What does a relational database bring to the table? Let's find out. Features a double-terminal environment connected to a shared, in-memory PostgreSQL instance.
              </p>
              <div className="flex gap-2">
                <span className="text-xs text-zinc-500">#ACID</span>
                <span className="text-xs text-zinc-500">#Concurrency</span>
                <span className="text-xs text-zinc-500">#Postgres</span>
              </div>
            </Link>
            <Link 
              href="/databases/relationaldbs" 
              className="group block border border-zinc-800 bg-[#151515] p-5 rounded-sm hover:border-zinc-600 transition-colors duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg text-zinc-200 font-semibold group-hover:text-amber-400 transition-colors">
                  03. Isolation Levels: The 'I' in ACID
                </h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Interactive Lab
                </span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Because 'sharing is caring' is a terrible philosophy for concurrent SQL transactions.
              </p>
              <div className="flex gap-2">
                <span className="text-xs text-zinc-500">#ACID</span>
                <span className="text-xs text-zinc-500">#Concurrency</span>
                <span className="text-xs text-zinc-500">#Postgres</span>
              </div>
            </Link>
            <Link 
              href="/databases/relationaldbs" 
              className="group block border border-zinc-800 bg-[#151515] p-5 rounded-sm hover:border-zinc-600 transition-colors duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg text-zinc-200 font-semibold group-hover:text-amber-400 transition-colors">
                  04. Scaling Databases
                </h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Interactive Lab
                </span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Why just buy a bigger server' is a strategy that eventually hits the laws of physics.
              </p>
              <div className="flex gap-2">
                <span className="text-xs text-zinc-500">#ACID</span>
                <span className="text-xs text-zinc-500">#Concurrency</span>
                <span className="text-xs text-zinc-500">#Postgres</span>
              </div>
            </Link>

            {/* Placeholder for future module */}
            <div className="block border border-zinc-800/50 bg-[#111111] p-5 rounded-sm opacity-50 cursor-not-allowed">
               <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg text-zinc-500 font-semibold">
                  02. Distributed Storage (Coming Soon)
                </h3>
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Explore replication, heartbeats, and consistency models.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}