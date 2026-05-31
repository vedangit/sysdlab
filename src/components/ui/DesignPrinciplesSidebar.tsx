"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/lld/design-principles", label: "00. Principles Index" },
  { href: "/lld/design-principles/extensible-systems", label: "01. Extensible Systems" },
  { href: "/lld/design-principles/robust-contracts", label: "02. Robust Contracts" },
  { href: "/lld/design-principles/minimalist-architecture", label: "03. Minimalist Architecture" },
];

export function DesignPrinciplesSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-zinc-800/50 min-h-[calc(100vh-4rem)] pt-10 pr-6">
      <div className="sticky top-10">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
          LLD: Design Principles
        </span>
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-mono py-1.5 transition-colors border-l-2 pl-3 ${
                  isActive
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 border border-zinc-800 bg-[#101010] p-4">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
            Analyzer Mode
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Principle checker online
          </div>
        </div>
      </div>
    </aside>
  );
}
