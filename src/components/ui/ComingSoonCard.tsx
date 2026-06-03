"use client";

type ComingSoonCardProps = {
  title: string;
  description: string;
  badges: string[];
  lockLabel?: string;
};

export function ComingSoonCard({ title, description, badges, lockLabel = "Coming soon" }: ComingSoonCardProps) {
  return (
    <div className="group relative overflow-hidden border border-zinc-800 bg-[#151515] p-5 transition-colors hover:border-zinc-700">
      <div className="pointer-events-none absolute -right-2 -top-4 text-[11rem] text-zinc-900/35">
        🔒
      </div>
      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500">
          <span>{lockLabel}</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-100 transition-colors group-hover:text-amber-400">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
