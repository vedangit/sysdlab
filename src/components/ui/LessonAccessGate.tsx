"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getLesson, type CourseId } from "@/lib/course-catalog";
import {
  readLessonAccessState,
  type LessonAccessState,
  writeLessonAccessState,
} from "@/lib/lesson-access";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

type LessonAccessGateProps = {
  courseId: CourseId;
  children: ReactNode;
};

function useLessonAccessState() {
  const [state, setState] = useState<LessonAccessState>(() => readLessonAccessState());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "sysdlab.lesson-access.v1") return;
      setState(readLessonAccessState());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLessonAccess = (next: LessonAccessState) => {
    setState(next);
    writeLessonAccessState(next);
  };

  return { state, setLessonAccess };
}

export function LessonAccessGate({ courseId, children }: LessonAccessGateProps) {
  const pathname = usePathname();
  const { session, isReady } = useSupabaseAuth();
  const { isOpen, mode, openRequired, close } = useAuthModal();
  const { state, setLessonAccess } = useLessonAccessState();

  const currentLesson = useMemo(() => getLesson(courseId, pathname), [courseId, pathname]);
  const isLessonPage = Boolean(currentLesson);

  const isLocked = Boolean(
    isReady &&
      isLessonPage &&
      !session?.user &&
      state.freeLessonHref &&
      state.freeLessonHref !== currentLesson?.href,
  );

  useEffect(() => {
    if (!isReady || !currentLesson) return;

    if (!state.freeLessonHref) {
      setLessonAccess({
        version: 1,
        freeLessonHref: currentLesson.href,
      });
    }
  }, [currentLesson, isReady, setLessonAccess, state.freeLessonHref]);

  useEffect(() => {
    if (isLocked) {
      openRequired();
    } else if (isOpen && mode === "required") {
      close();
    }
  }, [close, isLocked, isOpen, mode, openRequired]);

  const contentClassName = isLocked ? "pointer-events-none select-none opacity-30 blur-[1px]" : "";

  return (
    <div className="relative">
      <div aria-hidden={isLocked} className={contentClassName}>
        {children}
      </div>

      {isLocked ? (
        <div className="absolute inset-0 z-20 bg-black/10" />
      ) : null}
    </div>
  );
}
