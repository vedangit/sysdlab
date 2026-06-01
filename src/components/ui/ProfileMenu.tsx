"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

export function ProfileMenu() {
  const { session, isConfigured, isReady, signOut } = useSupabaseAuth();
  const { openOptional } = useAuthModal();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const avatar = useMemo(() => {
    const email = session?.user?.email ?? "";
    return email?.[0]?.toUpperCase() ?? "U";
  }, [session?.user?.email]);

  if (!isConfigured) {
    return (
      <span className="text-[10px] uppercase tracking-wider text-zinc-600">
        Sign-in unavailable
      </span>
    );
  }

  if (!isReady) {
    return (
      <span className="text-[10px] uppercase tracking-wider text-zinc-600">
        Loading account
      </span>
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={openOptional}
        aria-label="Open sign in dialog"
        className="border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
      >
        Sign in
      </button>
    );
  }

  const email = session.user.email ?? "Signed in";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Profile menu for ${email}`}
        className="flex items-center gap-2 border border-zinc-800 bg-[#0f0f0f] px-2 py-1 transition-colors hover:border-zinc-600"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-semibold text-emerald-300">
          {avatar}
        </span>
        <span className="hidden max-w-[140px] truncate text-[11px] text-zinc-400 sm:inline">
          {email}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-64 border border-zinc-800 bg-[#101010] p-3 shadow-2xl shadow-black/40">
          <div className="border-b border-zinc-800 pb-3">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Signed in as
            </div>
            <div className="mt-2 truncate text-sm text-zinc-200">{email}</div>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="mt-3 block border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            View profile
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            className="mt-3 w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
