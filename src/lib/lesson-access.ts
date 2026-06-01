export type LessonAccessState = {
  version: 1;
  freeLessonHref: string | null;
};

export const lessonAccessStorageKey = "sysdlab.lesson-access.v1";

export function createEmptyLessonAccess(): LessonAccessState {
  return {
    version: 1,
    freeLessonHref: null,
  };
}

export function readLessonAccessState(): LessonAccessState {
  if (typeof window === "undefined") {
    return createEmptyLessonAccess();
  }

  try {
    const raw = window.localStorage.getItem(lessonAccessStorageKey);
    if (!raw) return createEmptyLessonAccess();

    const parsed = JSON.parse(raw) as LessonAccessState;
    if (parsed?.version !== 1) return createEmptyLessonAccess();

    return {
      version: 1,
      freeLessonHref: typeof parsed.freeLessonHref === "string" ? parsed.freeLessonHref : null,
    };
  } catch {
    return createEmptyLessonAccess();
  }
}

export function writeLessonAccessState(state: LessonAccessState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(lessonAccessStorageKey, JSON.stringify(state));
}
