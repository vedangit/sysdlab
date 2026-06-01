"use client";

import { createContext, useContext, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

type AuthModalMode = "optional" | "required";

type AuthModalContextValue = {
  isOpen: boolean;
  mode: AuthModalMode;
  openOptional: () => void;
  openRequired: () => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue>({
  isOpen: false,
  mode: "optional",
  openOptional: () => {},
  openRequired: () => {},
  close: () => {},
});

function getBackHref(pathname: string) {
  if (pathname.startsWith("/lld")) return "/lld";
  if (pathname.startsWith("/databases")) return "/databases";
  return "/";
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.655 32.659 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.157 7.961 3.043l5.657-5.657C34.477 6.053 29.521 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.157 7.961 3.043l5.657-5.657C34.477 6.053 29.521 4 24 4c-7.682 0-14.358 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.432 0 10.305-1.965 14.11-5.188l-6.51-5.481C29.473 34.71 26.933 36 24 36c-5.218 0-9.619-3.314-11.263-7.946l-6.52 5.018C9.519 39.199 16.198 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-1.248 3.159-3.542 5.574-6.204 7.331l.003-.002 6.51 5.481C35.14 39.96 44 33.7 44 24c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-current">
      <path d="M12 .5C5.73.5.5 5.73.5 12.18c0 5.16 3.33 9.54 7.95 11.09.58.11.79-.26.79-.58v-2.15c-3.24.72-3.92-1.55-3.92-1.55-.53-1.39-1.3-1.76-1.3-1.76-1.06-.75.08-.74.08-.74 1.17.08 1.79 1.24 1.79 1.24 1.03 1.8 2.7 1.28 3.36.98.1-.78.41-1.28.75-1.58-2.59-.3-5.31-1.33-5.31-5.93 0-1.31.45-2.38 1.19-3.22-.12-.3-.52-1.52.11-3.17 0 0 .97-.32 3.18 1.23.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.21-1.55 3.18-1.23 3.18-1.23.63 1.65.23 2.87.11 3.17.74.84 1.19 1.91 1.19 3.22 0 4.61-2.72 5.63-5.32 5.92.42.37.79 1.1.79 2.22v3.29c0 .33.21.69.8.58 4.61-1.55 7.94-5.93 7.94-11.08C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function AuthModal() {
  const pathname = usePathname();
  const { isConfigured, isReady, signInWithEmail, signInWithGitHub, signInWithGoogle } =
    useSupabaseAuth();
  const { isOpen, mode, close } = useAuthModal();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const backHref = getBackHref(pathname);

  if (!isOpen) return null;

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSending(true);
    const result = await signInWithEmail(email);
    setIsSending(false);
    setStatus(result.ok ? "Magic link sent. Check your inbox." : result.message ?? "Could not send email sign-in link.");
  };

  const handleGitHub = async () => {
    setStatus(null);
    setIsSending(true);
    const result = await signInWithGitHub();
    setIsSending(false);
    if (!result.ok) {
      setStatus(result.message ?? "Could not start GitHub sign-in.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg border border-zinc-800 bg-[#111111] shadow-2xl shadow-black/40">
        <div className="border-b border-zinc-800 bg-zinc-950 px-5 py-4">
          <div className="text-[10px] uppercase tracking-widest text-amber-500/80">
            {mode === "required" ? "Login required" : "Optional login"}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-zinc-100">
            {mode === "required" ? "Sign in to continue" : "Choose a sign-in method"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {mode === "required"
              ? "Sign in with email or GitHub to keep browsing."
              : "Use email magic links or GitHub auth through Supabase."}
          </p>
        </div>

        <div className="space-y-4 p-5">
          {!isConfigured ? (
            <div className="border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-400">
              Auth setup is still pending in this deployment.
            </div>
          ) : null}

          <form className="space-y-3" onSubmit={handleEmailSubmit}>
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-widest text-zinc-500">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full border border-zinc-800 bg-[#0c0c0c] px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500/40"
              />
            </label>

            <button
              type="submit"
              disabled={isSending || !isReady || !isConfigured}
              className="w-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send magic link
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-600">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <button
            type="button"
            onClick={handleGitHub}
            disabled={isSending || !isReady || !isConfigured}
            className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GitHubLogo />
            Continue with GitHub
          </button>

          <button
            type="button"
            onClick={async () => {
              setStatus(null);
              setIsSending(true);
              const result = await signInWithGoogle();
              setIsSending(false);
              if (!result.ok) {
                setStatus(result.message ?? "Could not start Google sign-in.");
              }
            }}
            disabled={isSending || !isReady || !isConfigured}
            className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleLogo />
            Continue with Google
          </button>

          {status ? (
            <div className="border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
              {status}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              href={backHref}
              className="text-xs uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Back to course
            </Link>
            {mode === "optional" ? (
              <button
                type="button"
                onClick={close}
                className="text-xs uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-300"
              >
                Close
              </button>
            ) : (
              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                Required to continue
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>("optional");

  const value = useMemo<AuthModalContextValue>(
    () => ({
      isOpen,
      mode,
      openOptional: () => {
        setMode("optional");
        setIsOpen(true);
      },
      openRequired: () => {
        setMode("required");
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
        setMode("optional");
      },
    }),
    [isOpen, mode],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthModalContext.Provider>
  );
}

export { useAuthModal };
