"use client";

import { CourseProgressProvider } from "@/components/providers/CourseProgressProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <PostHogProvider>
        <AuthModalProvider>
          <CourseProgressProvider>{children}</CourseProgressProvider>
        </AuthModalProvider>
      </PostHogProvider>
    </SupabaseAuthProvider>
  );
}
