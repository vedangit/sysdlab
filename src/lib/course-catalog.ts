export type CourseId = "lld" | "databases";

export type TrackId =
  | "oop"
  | "design-principles"
  | "creational-patterns"
  | "factory-pattern"
  | "core";

export type LessonId = string;

export type LabId =
  | "shallow-copy"
  | "singleton"
  | "vtable"
  | "relationships"
  | "encapsulation"
  | "interface-collision"
  | "variance"
  | "generic-cache"
  | "constructor-explosion"
  | "singleton-pool"
  | "pattern-matching"
  | "factory-centralization"
  | "factory-nightmare"
  | "factory-registry"
  | "srp"
  | "ocp"
  | "lsp"
  | "dip"
  | "dry"
  | "yagni";

export type LessonMeta = {
  id: LessonId;
  href: string;
  title: string;
  summary: string;
  order: number;
  labs: LabId[];
};

export type TrackMeta = {
  id: TrackId;
  href: string;
  title: string;
  summary: string;
  badge: string;
  lessons: LessonMeta[];
};

export type CourseMeta = {
  id: CourseId;
  title: string;
  tracks: TrackMeta[];
};

const oopLessons: LessonMeta[] = [
  {
    id: "/lld/oop/instance-initialization",
    href: "/lld/oop/instance-initialization",
    title: "Instance Initialization",
    summary:
      "Object allocation, constructor paths, copy lifecycles, singleton guards, and the implicit current-object reference.",
    order: 1,
    labs: ["shallow-copy", "singleton"],
  },
  {
    id: "/lld/oop/runtime-dispatch",
    href: "/lld/oop/runtime-dispatch",
    title: "Runtime Dispatch",
    summary:
      "Overloading, overriding, vtable routing, inheritance topology, and structural relationships between classes.",
    order: 2,
    labs: ["vtable", "relationships"],
  },
  {
    id: "/lld/oop/encapsulation-abstraction",
    href: "/lld/oop/encapsulation-abstraction",
    title: "Encapsulation & Abstraction",
    summary:
      "Visibility boundaries, invariant protection, abstract classes, interfaces, and default-method conflict resolution.",
    order: 3,
    labs: ["encapsulation", "interface-collision"],
  },
  {
    id: "/lld/oop/generics",
    href: "/lld/oop/generics",
    title: "Parameterized Polymorphism",
    summary:
      "Generics, type erasure, wildcard variance, and type-safe reusable containers.",
    order: 4,
    labs: ["variance", "generic-cache"],
  },
];

const designPrinciplesLessons: LessonMeta[] = [
  {
    id: "/lld/design-principles/extensible-systems",
    href: "/lld/design-principles/extensible-systems",
    title: "Extensible Systems",
    summary: "SRP and OCP keep responsibilities narrow and extension points explicit.",
    order: 1,
    labs: ["srp", "ocp"],
  },
  {
    id: "/lld/design-principles/robust-contracts",
    href: "/lld/design-principles/robust-contracts",
    title: "Robust Contracts",
    summary: "LSP, ISP, and DIP make hierarchies honest and dependencies testable.",
    order: 2,
    labs: ["lsp", "dip"],
  },
  {
    id: "/lld/design-principles/minimalist-architecture",
    href: "/lld/design-principles/minimalist-architecture",
    title: "Minimalist Architecture",
    summary: "DRY, KISS, and YAGNI keep the codebase small, direct, and easy to change.",
    order: 3,
    labs: ["dry", "yagni"],
  },
];

const creationalPatternsLessons: LessonMeta[] = [
  {
    id: "/lld/creational-patterns/overview",
    href: "/lld/creational-patterns/overview",
    title: "Overview",
    summary:
      "Constructor explosion, singleton resource control, and the pattern choices that decouple object creation.",
    order: 1,
    labs: ["constructor-explosion", "singleton-pool", "pattern-matching"],
  },
];

const factoryPatternLessons: LessonMeta[] = [
  {
    id: "/lld/factory-pattern/overview",
    href: "/lld/factory-pattern/overview",
    title: "Factory Design Pattern",
    summary:
      "Centralize object creation, remove client-side `new`, and use a registry when the set of types keeps growing.",
    order: 1,
    labs: ["factory-centralization", "factory-nightmare", "factory-registry"],
  },
];

const databaseLessons: LessonMeta[] = [
  {
    id: "/databases/whydb",
    href: "/databases/whydb",
    title: "Why Databases Exist",
    summary: "Why persistence, indexing, and query planning exist in the first place.",
    order: 1,
    labs: [],
  },
  {
    id: "/databases/relationaldbs",
    href: "/databases/relationaldbs",
    title: "Relational Databases",
    summary: "Tables, transactions, ACID behavior, and the basics of relational modeling.",
    order: 2,
    labs: [],
  },
  {
    id: "/databases/isolation",
    href: "/databases/isolation",
    title: "Isolation Levels",
    summary: "How concurrent transactions interact and why anomalies appear.",
    order: 3,
    labs: [],
  },
  {
    id: "/databases/scalingdbs",
    href: "/databases/scalingdbs",
    title: "Scaling Databases",
    summary: "Replication, sharding, and the path from a single node to distributed storage.",
    order: 4,
    labs: [],
  },
];

export const courseCatalog: Record<CourseId, CourseMeta> = {
  lld: {
    id: "lld",
    title: "Low Level Design",
    tracks: [
      {
        id: "oop",
        href: "/lld/oop",
        title: "Object-Oriented Programming",
        summary:
          "Classes, constructors, runtime dispatch, encapsulation, and generics with memory-level labs.",
        badge: "Interactive Series",
        lessons: oopLessons,
      },
      {
        id: "design-principles",
        href: "/lld/design-principles",
        title: "Design Principles",
        summary:
          "SRP, OCP, LSP, ISP, DIP, DRY, KISS, and YAGNI through refactoring-focused inspections.",
        badge: "Interactive Series",
        lessons: designPrinciplesLessons,
      },
      {
        id: "creational-patterns",
        href: "/lld/creational-patterns",
        title: "Creational Patterns",
        summary:
          "Constructor explosion, singleton resource control, and the pattern choices that decouple object creation.",
        badge: "Interactive Series",
        lessons: creationalPatternsLessons,
      },
      {
        id: "factory-pattern",
        href: "/lld/factory-pattern",
        title: "Factory Design Pattern",
        summary:
          "Vehicle creation, constructor drift, and a registry-driven factory that keeps client code stable.",
        badge: "Interactive Series",
        lessons: factoryPatternLessons,
      },
    ],
  },
  databases: {
    id: "databases",
    title: "Databases",
    tracks: [
      {
        id: "core",
        href: "/databases",
        title: "Database Systems",
        summary:
          "Why databases exist, how relational storage works, what isolation means, and how systems scale.",
        badge: "Interactive Series",
        lessons: databaseLessons,
      },
    ],
  },
};

export function getCourse(courseId: CourseId) {
  return courseCatalog[courseId];
}

export function getTrack(courseId: CourseId, trackId: TrackId) {
  return courseCatalog[courseId].tracks.find((track) => track.id === trackId);
}

export function getLesson(courseId: CourseId, lessonHref: string) {
  return courseCatalog[courseId].tracks
    .flatMap((track) => track.lessons)
    .find((lesson) => lesson.href === lessonHref);
}

export function getAllLessons(courseId: CourseId) {
  return courseCatalog[courseId].tracks.flatMap((track) => track.lessons);
}
