"use client";

import { CourseProgressProvider } from "@/components/providers/CourseProgressProvider";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <CourseProgressProvider>{children}</CourseProgressProvider>
    </SupabaseAuthProvider>
  );
}
