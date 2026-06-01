"use client";

import { CourseProgressProvider } from "@/components/providers/CourseProgressProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <AuthModalProvider>
        <CourseProgressProvider>{children}</CourseProgressProvider>
      </AuthModalProvider>
    </SupabaseAuthProvider>
  );
}
