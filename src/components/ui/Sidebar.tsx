"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/databases/whydb", label: "01. Why Databases Exist" },
    { href: "/databases/relationaldbs", label: "02. Relational Databases" },
    { href: "/databases/isolation", label: "03. Isolation" },
    { href: "/databases/scalingdbs", label: "04. Scaling Databases" },
  ];

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-zinc-800/50 min-h-[calc(100vh-4rem)] pt-10 pr-6">
      <div className="sticky top-10">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
          Core Curriculum
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
                    ? "border-emerald-500 text-emerald-400" 
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}