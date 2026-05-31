import type { CourseId, LessonId, LabId } from "@/lib/course-catalog";

export type LabStatus = "idle" | "pass" | "fail";

export type LessonProgressRecord = {
  lessonId: LessonId;
  manualCompleted: boolean;
  completed: boolean;
  labResults: Record<string, LabStatus>;
  updatedAt: number;
};

export type CourseProgressState = {
  version: 1;
  courses: Partial<Record<CourseId, Record<LessonId, LessonProgressRecord>>>;
};

export const courseProgressStorageKey = "sysdlab.course-progress.v1";

export function createEmptyProgress(): CourseProgressState {
  return {
    version: 1,
    courses: {},
  };
}

export function getLessonRecord(
  state: CourseProgressState,
  courseId: CourseId,
  lessonId: LessonId,
): LessonProgressRecord {
  const existing = state.courses[courseId]?.[lessonId];
  if (existing) return existing;

  return {
    lessonId,
    manualCompleted: false,
    completed: false,
    labResults: {},
    updatedAt: Date.now(),
  };
}

export function lessonHasAllPassingLabs(
  record: LessonProgressRecord,
  lessonLabIds: LabId[],
) {
  if (lessonLabIds.length === 0) return record.manualCompleted;
  return lessonLabIds.every((labId) => record.labResults[labId] === "pass");
}

export function lessonIsCompleted(
  record: LessonProgressRecord,
  lessonLabIds: LabId[],
) {
  return record.manualCompleted || lessonHasAllPassingLabs(record, lessonLabIds);
}

export function mergeLessonRecord(
  current: LessonProgressRecord | undefined,
  incoming: Partial<LessonProgressRecord> & { lessonId: LessonId },
) {
  const base = current ?? {
    lessonId: incoming.lessonId,
    manualCompleted: false,
    completed: false,
    labResults: {},
    updatedAt: 0,
  };

  const nextLabResults = { ...base.labResults };
  for (const [labId, incomingStatus] of Object.entries(incoming.labResults ?? {})) {
    const existingStatus = nextLabResults[labId];
    const statusWeight: Record<LabStatus, number> = {
      idle: 0,
      fail: 1,
      pass: 2,
    };

    if (!existingStatus || statusWeight[incomingStatus as LabStatus] >= statusWeight[existingStatus as LabStatus]) {
      nextLabResults[labId] = incomingStatus as LabStatus;
    }
  }

  const mergedLabResults = {
    ...nextLabResults,
  };

  return {
    lessonId: incoming.lessonId,
    manualCompleted: base.manualCompleted || Boolean(incoming.manualCompleted),
    completed: base.completed || Boolean(incoming.completed) || base.manualCompleted || Boolean(incoming.manualCompleted),
    labResults: mergedLabResults,
    updatedAt: Math.max(base.updatedAt, incoming.updatedAt ?? 0, Date.now()),
  };
}

export function cloneProgressState(state: CourseProgressState): CourseProgressState {
  return {
    version: state.version,
    courses: Object.fromEntries(
      Object.entries(state.courses).map(([courseId, lessons]) => [
        courseId,
        Object.fromEntries(
          Object.entries(lessons ?? {}).map(([lessonId, record]) => [
            lessonId,
            {
              ...record,
              labResults: { ...record.labResults },
            },
          ]),
        ),
      ]),
    ) as CourseProgressState["courses"],
  };
}
