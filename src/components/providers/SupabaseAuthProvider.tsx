"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { getAuthRedirectUrl } from "@/lib/auth-redirect";
import { capturePostHog, identifyPostHog, resetPostHog } from "@/lib/posthog";

type SupabaseAuthContextValue = {
  client: SupabaseClient | null;
  session: Session | null;
  isReady: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string) => Promise<{ ok: boolean; message?: string }>;
  signInWithGitHub: () => Promise<{ ok: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue>({
  client: null,
  session: null,
  isReady: false,
  isConfigured: false,
  signInWithEmail: async () => ({ ok: false }),
  signInWithGitHub: async () => ({ ok: false }),
  signInWithGoogle: async () => ({ ok: false }),
  signOut: async () => {},
});

function buildClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => buildClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(() => !client);

  useEffect(() => {
    let isMounted = true;

    if (!client) return;

    const init = async () => {
      const { data } = await client.auth.getSession();
      if (!isMounted) return;
      setSession(data.session);
      setIsReady(true);
    };

    init();

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);

      if (_event === "SIGNED_IN" && nextSession?.user) {
        identifyPostHog(nextSession.user.id, {
          email: nextSession.user.email ?? undefined,
          provider: nextSession.user.app_metadata?.provider ?? undefined,
        });
        capturePostHog("auth_signed_in", {
          provider: nextSession.user.app_metadata?.provider ?? "unknown",
        });
      }

      if (_event === "SIGNED_OUT") {
        capturePostHog("auth_signed_out");
        resetPostHog();
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [client]);

  const signInWithOAuth = useCallback(
    async (provider: "github" | "google") => {
      if (!client) return { ok: false, message: "Supabase is not configured." };

      const redirectTo = getAuthRedirectUrl();
      capturePostHog("auth_oauth_started", { provider });
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: redirectTo ? { redirectTo } : undefined,
      });

      if (error) {
        return { ok: false, message: error.message };
      }

      return { ok: true };
    },
    [client],
  );

  const value = useMemo<SupabaseAuthContextValue>(() => {
    return {
      client,
      session,
      isReady,
      isConfigured: Boolean(client),
      signInWithEmail: async (email: string) => {
        if (!client) return { ok: false, message: "Supabase is not configured." };

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          return { ok: false, message: "Enter an email address." };
        }

        const redirectTo = getAuthRedirectUrl();
        capturePostHog("auth_magic_link_requested", { email_domain: trimmedEmail.split("@")[1] ?? "" });
        const { error } = await client.auth.signInWithOtp({
          email: trimmedEmail,
          options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
        });

        if (error) {
          return { ok: false, message: error.message };
        }

        return { ok: true };
      },
      signInWithGitHub: async () => signInWithOAuth("github"),
      signInWithGoogle: async () => signInWithOAuth("google"),
      signOut: async () => {
        if (!client) return;
        await client.auth.signOut();
      },
    };
  }, [client, session, isReady, signInWithOAuth]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  return useContext(SupabaseAuthContext);
}
