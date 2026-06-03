"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { courseCatalog } from "@/lib/course-catalog";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import {
  readLessonFeedbackInterests,
  readLessonFeedbackPromptState,
  type LessonFeedbackInterest,
  type LessonFeedbackPromptState,
  writeLessonFeedbackInterests,
  writeLessonFeedbackPromptState,
} from "@/lib/lesson-feedback";

type FeedbackState = {
  lessonHref: string | null;
  lessonTitle: string | null;
  source: "lesson_completion" | "footer";
  headline: string;
  description: string;
};

type LessonFeedbackPromptContextValue = {
  openInterestPrompt: (feedback?: Partial<FeedbackState>) => void;
};

const LessonFeedbackPromptContext = createContext<LessonFeedbackPromptContextValue | null>(null);

function getAllLessons() {
  return Object.values(courseCatalog).flatMap((course) =>
    course.tracks.flatMap((track) => track.lessons),
  );
}

function EmailLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-current">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4.25-8 5-8-5V6l8 5 8-5v2.25z" />
    </svg>
  );
}

function LockBadge() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-current">
      <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z" />
    </svg>
  );
}

export function LessonFeedbackProvider({ children }: { children: React.ReactNode }) {
  const { progress, isLoaded } = useCourseProgress();
  const { client, session } = useSupabaseAuth();
  const [promptState, setPromptState] = useState<LessonFeedbackPromptState>(() =>
    readLessonFeedbackPromptState(),
  );
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackState | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const previousCompletionRef = useRef<Record<string, boolean>>({});
  const initializedRef = useRef(false);

  const promptedSet = useMemo(() => new Set(promptState.promptedLessonHrefs), [promptState]);

  const openInterestPrompt = useCallback(
    (feedback?: Partial<FeedbackState>) => {
      setCurrentFeedback({
        lessonHref: feedback?.lessonHref ?? null,
        lessonTitle: feedback?.lessonTitle ?? "the platform",
        source: feedback?.source ?? "footer",
        headline: feedback?.headline ?? "Quick feedback",
        description:
          feedback?.description ??
          "If the platform is useful, we’d love to keep you in the loop with future updates.",
      });
      setStatus(null);
      setEmail(session?.user?.email ?? "");
    },
    [session?.user?.email],
  );

  useEffect(() => {
    writeLessonFeedbackPromptState(promptState);
  }, [promptState]);

  useEffect(() => {
    if (!isLoaded) return;

    const currentCompletionMap: Record<string, boolean> = {};
    for (const lesson of getAllLessons()) {
      const lessonRecord =
        progress.courses.lld?.[lesson.href] ?? progress.courses.databases?.[lesson.href];
      currentCompletionMap[lesson.href] = Boolean(lessonRecord?.completed);
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      previousCompletionRef.current = currentCompletionMap;
      return;
    }

    if (currentFeedback) {
      previousCompletionRef.current = currentCompletionMap;
      return;
    }

    for (const lesson of getAllLessons()) {
      const previouslyCompleted = previousCompletionRef.current[lesson.href] ?? false;
      const currentlyCompleted = currentCompletionMap[lesson.href] ?? false;

      if (!currentlyCompleted || previouslyCompleted || promptedSet.has(lesson.href)) continue;

      window.setTimeout(() => {
        openInterestPrompt({
          lessonHref: lesson.href,
          lessonTitle: lesson.title,
          source: "lesson_completion",
          headline: "Quick feedback",
          description:
            "Did this lesson feel useful? If you’d like, we can send occasional updates as the lab grows.",
        });
        setPromptState((current) => ({
          version: 1,
          promptedLessonHrefs: Array.from(new Set([...current.promptedLessonHrefs, lesson.href])),
        }));
      }, 0);
      break;
    }

    previousCompletionRef.current = currentCompletionMap;
  }, [currentFeedback, isLoaded, openInterestPrompt, progress, promptedSet]);

  const close = () => {
    setCurrentFeedback(null);
    setStatus(null);
  };

  const saveInterest = async (interest: LessonFeedbackInterest) => {
    if (client) {
      const { error } = await client.from("lesson_feedback_interest").insert({
        lesson_href: interest.lessonHref,
        lesson_title: interest.lessonTitle,
        source: interest.source,
        email: interest.email,
        user_id: interest.userId,
        created_at: interest.createdAt,
      });

      if (!error) return true;
    }

    const existing = readLessonFeedbackInterests();
    const next = [
      ...existing.filter(
        (item) => item.lessonHref !== interest.lessonHref || item.email !== interest.email,
      ),
      interest,
    ];
    writeLessonFeedbackInterests(next);
    return false;
  };

  const handleLoggedIn = async () => {
    if (!currentFeedback) return;
    const resolvedEmail = session?.user?.email ?? "";
    if (!resolvedEmail) {
      setStatus("No email available on this account.");
      return;
    }

    await saveInterest({
      lessonHref: currentFeedback.lessonHref,
      lessonTitle: currentFeedback.lessonTitle,
      source: currentFeedback.source,
      email: resolvedEmail,
      userId: session?.user?.id ?? null,
      createdAt: new Date().toISOString(),
    });
    setStatus("Thanks — you’re on the updates list.");
    setTimeout(close, 900);
  };

  const handleGuestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentFeedback) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("Please enter an email address.");
      return;
    }

    await saveInterest({
      lessonHref: currentFeedback.lessonHref,
      lessonTitle: currentFeedback.lessonTitle,
      source: currentFeedback.source,
      email: trimmed,
      userId: null,
      createdAt: new Date().toISOString(),
    });
    setStatus("Thanks — you’re on the updates list.");
    setTimeout(close, 900);
  };

  return (
    <LessonFeedbackPromptContext.Provider value={{ openInterestPrompt }}>
      <>
        {children}
        {currentFeedback ? (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden border border-zinc-800 bg-[#111111] shadow-2xl shadow-black/40">
              <div className="absolute -right-2 -top-2 text-[9rem] text-zinc-900/35">
                <LockBadge />
              </div>
              <div className="border-b border-zinc-800 bg-zinc-950 px-5 py-4">
                <div className="text-[10px] uppercase tracking-widest text-amber-500/80">
                  {currentFeedback.headline}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-zinc-100">
                  Did you enjoy {currentFeedback.lessonTitle}?
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {currentFeedback.description}
                </p>
              </div>

              <div className="space-y-4 p-5">
                {session?.user ? (
                  <button
                    type="button"
                    onClick={handleLoggedIn}
                    className="flex w-full items-center justify-center gap-2 border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
                  >
                    <EmailLogo />
                    Yes, I would like an email
                  </button>
                ) : (
                  <form className="space-y-3" onSubmit={handleGuestSubmit}>
                    <label className="block">
                      <span className="mb-2 block text-[10px] uppercase tracking-widest text-zinc-500">
                        Email
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="w-full border border-zinc-800 bg-[#0c0c0c] px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500/40"
                      />
                    </label>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
                    >
                      <EmailLogo />
                      Yes, email me updates
                    </button>
                  </form>
                )}

                {status ? (
                  <div className="border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
                    {status}
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="text-xs uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    </LessonFeedbackPromptContext.Provider>
  );
}

export function useLessonFeedbackPrompt() {
  const context = useContext(LessonFeedbackPromptContext);
  if (!context) {
    throw new Error("useLessonFeedbackPrompt must be used within LessonFeedbackProvider");
  }

  return context;
}
