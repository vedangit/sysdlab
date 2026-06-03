export type LessonFeedbackInterest = {
  lessonHref: string | null;
  lessonTitle: string | null;
  source: "lesson_completion" | "footer";
  email: string;
  userId: string | null;
  createdAt: string;
};

export type LessonFeedbackPromptState = {
  version: 1;
  promptedLessonHrefs: string[];
};

export const lessonFeedbackPromptStorageKey = "sysdlab.lesson-feedback.prompted.v1";
export const lessonFeedbackInterestStorageKey = "sysdlab.lesson-feedback.interests.v1";

export function createEmptyLessonFeedbackPromptState(): LessonFeedbackPromptState {
  return { version: 1, promptedLessonHrefs: [] };
}

export function readLessonFeedbackPromptState(): LessonFeedbackPromptState {
  if (typeof window === "undefined") return createEmptyLessonFeedbackPromptState();

  try {
    const raw = window.localStorage.getItem(lessonFeedbackPromptStorageKey);
    if (!raw) return createEmptyLessonFeedbackPromptState();

    const parsed = JSON.parse(raw) as LessonFeedbackPromptState;
    if (parsed?.version !== 1 || !Array.isArray(parsed.promptedLessonHrefs)) {
      return createEmptyLessonFeedbackPromptState();
    }

    return {
      version: 1,
      promptedLessonHrefs: parsed.promptedLessonHrefs.filter((href) => typeof href === "string"),
    };
  } catch {
    return createEmptyLessonFeedbackPromptState();
  }
}

export function writeLessonFeedbackPromptState(state: LessonFeedbackPromptState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(lessonFeedbackPromptStorageKey, JSON.stringify(state));
}

export function readLessonFeedbackInterests(): LessonFeedbackInterest[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(lessonFeedbackInterestStorageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as LessonFeedbackInterest[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item &&
        (typeof item.lessonHref === "string" || item.lessonHref === null) &&
        (typeof item.lessonTitle === "string" || item.lessonTitle === null || typeof item.lessonTitle === "undefined") &&
        (item.source === "lesson_completion" || item.source === "footer" || typeof item.source === "undefined") &&
        typeof item.email === "string" &&
        typeof item.createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function writeLessonFeedbackInterests(interests: LessonFeedbackInterest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(lessonFeedbackInterestStorageKey, JSON.stringify(interests));
}
