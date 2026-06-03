"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { courseCatalog, getLesson, type CourseId, type LabId } from "@/lib/course-catalog";
import {
  cloneProgressState,
  courseProgressStorageKey,
  createEmptyProgress,
  getLessonRecord,
  lessonIsCompleted,
  mergeLessonRecord,
  type CourseProgressState,
  type LabStatus,
  type LessonProgressRecord,
} from "@/lib/course-progress";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { capturePostHog } from "@/lib/posthog";

type CourseProgressContextValue = {
  progress: CourseProgressState;
  isLoaded: boolean;
  recordLabResult: (courseId: CourseId, lessonId: string, labId: LabId, status: LabStatus) => void;
  toggleLesson: (courseId: CourseId, lessonId: string) => void;
  lessonRecord: (courseId: CourseId, lessonId: string) => LessonProgressRecord;
  isLessonComplete: (courseId: CourseId, lessonId: string) => boolean;
  completedLessonCount: (courseId: CourseId, trackId?: string) => number;
  totalLessonCount: (courseId: CourseId, trackId?: string) => number;
};

const CourseProgressContext = createContext<CourseProgressContextValue>({
  progress: createEmptyProgress(),
  isLoaded: false,
  recordLabResult: () => {},
  toggleLesson: () => {},
  lessonRecord: () => ({
    lessonId: "",
    manualCompleted: false,
    completed: false,
    labResults: {},
    updatedAt: Date.now(),
  }),
  isLessonComplete: () => false,
  completedLessonCount: () => 0,
  totalLessonCount: () => 0,
});

function readLocalProgress() {
  if (typeof window === "undefined") return createEmptyProgress();
  try {
    const raw = window.localStorage.getItem(courseProgressStorageKey);
    if (!raw) return createEmptyProgress();
    const parsed = JSON.parse(raw) as CourseProgressState;
    if (parsed?.version !== 1) return createEmptyProgress();
    return parsed;
  } catch {
    return createEmptyProgress();
  }
}

function writeLocalProgress(state: CourseProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(courseProgressStorageKey, JSON.stringify(state));
}

function mergeProgress(
  base: CourseProgressState,
  incoming: CourseProgressState,
): CourseProgressState {
  const merged = cloneProgressState(base);

  for (const [courseId, lessonMap] of Object.entries(incoming.courses) as Array<
    [CourseId, Record<string, LessonProgressRecord>]
  >) {
    merged.courses[courseId] = merged.courses[courseId] ?? {};

    for (const [lessonId, incomingRecord] of Object.entries(lessonMap)) {
      merged.courses[courseId]![lessonId] = mergeLessonRecord(
        merged.courses[courseId]![lessonId],
        incomingRecord,
      );
    }
  }

  return merged;
}

function buildRemotePayload(state: CourseProgressState, courseId: CourseId) {
  return Object.values(state.courses[courseId] ?? {}).map((record) => ({
    course_id: courseId,
    lesson_id: record.lessonId,
    manual_completed: record.manualCompleted,
    completed: record.completed,
    lab_results: record.labResults,
    updated_at: new Date(record.updatedAt).toISOString(),
  }));
}

export function CourseProgressProvider({ children }: { children: React.ReactNode }) {
  const { client, session, isReady, isConfigured } = useSupabaseAuth();
  const [progress, setProgress] = useState<CourseProgressState>(() => readLocalProgress());
  const [isRemoteSynced, setIsRemoteSynced] = useState(false);

  useEffect(() => {
    writeLocalProgress(progress);
  }, [progress]);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    let active = true;

    if (!isReady || !isConfigured || !client || !userId) return;

    const syncFromRemote = async () => {
      const { data, error } = await client
        .from("course_lesson_progress")
        .select("course_id, lesson_id, manual_completed, completed, lab_results, updated_at")
        .eq("user_id", userId);

      if (!active) return;
      if (error) {
        setIsRemoteSynced(false);
        return;
      }

      const remoteState: CourseProgressState = createEmptyProgress();

      for (const row of data ?? []) {
        const courseId = row.course_id as CourseId;
        remoteState.courses[courseId] = remoteState.courses[courseId] ?? {};
        remoteState.courses[courseId]![row.lesson_id] = {
          lessonId: row.lesson_id,
          manualCompleted: Boolean(row.manual_completed),
          completed: Boolean(row.completed),
          labResults: row.lab_results ?? {},
          updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
        };
      }

      setProgress((current) => mergeProgress(current, remoteState));
      setIsRemoteSynced(true);
    };

    syncFromRemote();

    return () => {
      active = false;
    };
  }, [client, userId, isConfigured, isReady]);

  useEffect(() => {
    if (!isRemoteSynced || !client || !userId || !isConfigured) return;

    const syncToRemote = async () => {
      for (const courseId of Object.keys(progress.courses) as CourseId[]) {
        const payload = buildRemotePayload(progress, courseId);
        if (payload.length === 0) continue;

        await client.from("course_lesson_progress").upsert(
          payload.map((row) => ({
            user_id: userId,
            ...row,
          })),
          {
            onConflict: "user_id,course_id,lesson_id",
          },
        );
      }
    };

    syncToRemote();
  }, [client, progress, userId, isConfigured, isRemoteSynced]);

  const recordLabResult = useCallback(
    (courseId: CourseId, lessonId: string, labId: LabId, status: LabStatus) => {
      const lesson = getLesson(courseId, lessonId);
      if (!lesson) return;
      const course = courseCatalog[courseId];

      const existing = getLessonRecord(progress, courseId, lessonId);

      setProgress((current) => {
        const next = cloneProgressState(current);
        next.courses[courseId] = next.courses[courseId] ?? {};
        const record = getLessonRecord(next, courseId, lessonId);
        const updatedRecord: LessonProgressRecord = {
          ...record,
          labResults: {
            ...record.labResults,
            [labId]: status,
          },
          updatedAt: Date.now(),
        };
        updatedRecord.completed = lessonIsCompleted(updatedRecord, lesson.labs);
        next.courses[courseId]![lessonId] = updatedRecord;
        return next;
      });

      if (!existing.completed) {
        const completedRecord = {
          ...existing,
          labResults: {
            ...existing.labResults,
            [labId]: status,
          },
        };
        const nextCompleted = lessonIsCompleted(completedRecord, lesson.labs);
        if (nextCompleted) {
          capturePostHog("lesson_completed", {
            course_id: courseId,
            course_title: course.title,
            lesson_id: lessonId,
            lesson_title: lesson.title,
            lab_id: labId,
            completion_source: "lab_result",
          });
        }
      }
    },
    [progress],
  );

  const toggleLesson = useCallback((courseId: CourseId, lessonId: string) => {
    const lesson = getLesson(courseId, lessonId);
    if (!lesson) return;
    const course = courseCatalog[courseId];

    const existing = getLessonRecord(progress, courseId, lessonId);

    setProgress((current) => {
      const next = cloneProgressState(current);
      next.courses[courseId] = next.courses[courseId] ?? {};
      const record = getLessonRecord(next, courseId, lessonId);
      const manualCompleted = !record.manualCompleted;
      const updatedRecord: LessonProgressRecord = {
        ...record,
        manualCompleted,
        updatedAt: Date.now(),
      };
      updatedRecord.completed = lessonIsCompleted(updatedRecord, lesson.labs);
      next.courses[courseId]![lessonId] = updatedRecord;
      return next;
    });

    if (!existing.completed) {
      const toggledRecord: LessonProgressRecord = {
        ...existing,
        manualCompleted: !existing.manualCompleted,
      };
      toggledRecord.completed = lessonIsCompleted(toggledRecord, lesson.labs);
      if (toggledRecord.completed) {
        capturePostHog("lesson_completed", {
          course_id: courseId,
          course_title: course.title,
          lesson_id: lessonId,
          lesson_title: lesson.title,
          completion_source: "manual_toggle",
        });
      }
    }
  }, [progress]);

  const value = useMemo<CourseProgressContextValue>(() => {
    const lessonRecord = (courseId: CourseId, lessonId: string) =>
      getLessonRecord(progress, courseId, lessonId);

    const isLessonComplete = (courseId: CourseId, lessonId: string) => {
      const lesson = getLesson(courseId, lessonId);
      if (!lesson) return false;
      const record = getLessonRecord(progress, courseId, lessonId);
      return lessonIsCompleted(record, lesson.labs);
    };

    const totalLessonCount = (courseId: CourseId, trackId?: string) => {
      const course = courseCatalog[courseId];
      const lessons = trackId
        ? course.tracks.find((track) => track.id === trackId)?.lessons ?? []
        : course.tracks.flatMap((track) => track.lessons);
      return lessons.length;
    };

    const completedLessonCount = (courseId: CourseId, trackId?: string) => {
      const course = courseCatalog[courseId];
      const lessons = trackId
        ? course.tracks.find((track) => track.id === trackId)?.lessons ?? []
        : course.tracks.flatMap((track) => track.lessons);
      return lessons.filter((lesson) => isLessonComplete(courseId, lesson.href)).length;
    };

    return {
      progress,
      isLoaded: true,
      recordLabResult,
      toggleLesson,
      lessonRecord,
      isLessonComplete,
      completedLessonCount,
      totalLessonCount,
    };
  }, [progress, recordLabResult, toggleLesson]);

  return <CourseProgressContext.Provider value={value}>{children}</CourseProgressContext.Provider>;
}

export function useCourseProgress() {
  return useContext(CourseProgressContext);
}
