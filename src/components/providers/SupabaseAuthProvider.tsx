"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseAuthContextValue = {
  client: SupabaseClient | null;
  session: Session | null;
  isReady: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue>({
  client: null,
  session: null,
  isReady: false,
  isConfigured: false,
  signInWithGoogle: async () => {},
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
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo<SupabaseAuthContextValue>(() => {
    return {
      client,
      session,
      isReady,
      isConfigured: Boolean(client),
      signInWithGoogle: async () => {
        if (!client) return;

        const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;

        await client.auth.signInWithOAuth({
          provider: "google",
          options: redirectTo ? { redirectTo } : undefined,
        });
      },
      signOut: async () => {
        if (!client) return;
        await client.auth.signOut();
      },
    };
  }, [client, session, isReady]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  return useContext(SupabaseAuthContext);
}
