"use client";

import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

export function AuthStatusButton() {
  const { session, isConfigured, isReady, signOut } = useSupabaseAuth();
  const { openOptional } = useAuthModal();

  if (!isConfigured) {
    return (
      <span className="text-[10px] uppercase tracking-wider text-zinc-600">
        Auth setup pending
      </span>
    );
  }

  if (!isReady) {
    return (
      <span className="text-[10px] uppercase tracking-wider text-zinc-600">
        Loading auth
      </span>
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={openOptional}
        className="border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
      >
        Sign in
      </button>
    );
  }

  const email = session.user.email ?? "Signed in";
  const initial = email[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 border border-zinc-800 bg-[#0f0f0f] px-2 py-1">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-semibold text-emerald-300">
          {initial}
        </span>
        <span className="max-w-[140px] truncate text-[11px] text-zinc-400">{email}</span>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="border border-zinc-700 bg-zinc-900 px-3 py-1 text-[11px] uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
      >
        Sign out
      </button>
    </div>
  );
}
