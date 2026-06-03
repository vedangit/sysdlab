import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

let initialized = false;

function ensureInitialized() {
  if (initialized || typeof window === "undefined" || !posthogKey) return;

  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    capture_pageleave: true,
    loaded: (instance) => {
      if (process.env.NODE_ENV === "development") {
        instance.debug();
      }
    },
  });

  initialized = true;
}

export function isPostHogConfigured() {
  return Boolean(posthogKey);
}

export function initPostHog() {
  ensureInitialized();
}

export function capturePostHog(event: string, properties?: Record<string, unknown>) {
  ensureInitialized();
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identifyPostHog(
  userId: string,
  properties?: Record<string, unknown>,
) {
  ensureInitialized();
  if (!initialized) return;
  posthog.identify(userId, properties);
}

export function resetPostHog() {
  ensureInitialized();
  if (!initialized) return;
  posthog.reset();
}

