"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import {
  capturePostHog,
  identifyPostHog,
  initPostHog,
  isPostHogConfigured,
  resetPostHog,
} from "@/lib/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, isReady } = useSupabaseAuth();
  const previousUserIdRef = useRef<string | null | undefined>(undefined);
  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;
  const userProvider = session?.user?.app_metadata?.provider ?? null;
  const userName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.user_metadata?.name ??
    userEmail ??
    null;

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (!isPostHogConfigured() || typeof window === "undefined" || !pathname) return;
    capturePostHog("$pageview", {
      path: pathname,
      search: window.location.search.replace(/^\?/, ""),
      current_url: window.location.href,
    });
  }, [pathname]);

  useEffect(() => {
    if (!isReady || !isPostHogConfigured()) return;

    const nextUserId = userId;
    if (nextUserId && previousUserIdRef.current !== nextUserId) {
      identifyPostHog(nextUserId, {
        email: userEmail ?? undefined,
        provider: userProvider ?? undefined,
        name: userName ?? undefined,
      });
    } else if (previousUserIdRef.current && !nextUserId) {
      resetPostHog();
    }

    previousUserIdRef.current = nextUserId;
  }, [isReady, userEmail, userId, userName, userProvider]);

  return children;
}
