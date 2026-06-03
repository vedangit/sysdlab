"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileMenu } from "@/components/ui/ProfileMenu";

export const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Index" },
    { href: "/lld", label: "LLD" },
    { href: "/databases", label: "Databases" },
  ];

  const currentLabel = pathname.startsWith("/lld")
    ? "LLD"
    : pathname.startsWith("/databases")
      ? "Databases"
      : "Index";

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-[#111111] px-6 py-4 font-mono text-sm md:px-16">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight text-zinc-200 transition-colors hover:text-amber-400"
        >
          <span className="text-amber-500">~/</span>
          system-design-lab
        </Link>
        <span className="border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500 sm:hidden">
          {currentLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 text-zinc-500">
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-sm border px-2 py-1 text-[11px] uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    : "border-transparent text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <ProfileMenu />
      </div>
    </nav>
  );
};
