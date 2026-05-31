"use client";

import { useMemo, useState } from "react";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";

type Tone = "neutral" | "good" | "bad" | "warn";

type Signal = {
  label: string;
  value: string;
  tone?: Tone;
};

type LabResult = {
  status: "idle" | "pass" | "fail";
  title: string;
  detail: string;
  trace: string[];
  signals: Signal[];
};

type BuilderFeature = {
  id: string;
  label: string;
  signature: string;
};

type MatchPrompt = {
  id: string;
  prompt: string;
  answer: string;
};

const builderFeatures: BuilderFeature[] = [
  { id: "useSSL", label: "useSSL", signature: "boolean useSSL" },
  { id: "connectionTimeout", label: "connectionTimeout", signature: "int connectionTimeout" },
  { id: "maxPoolSize", label: "maxPoolSize", signature: "int maxPoolSize" },
  { id: "readReplicaHost", label: "readReplicaHost", signature: "String readReplicaHost" },
  { id: "enableLogging", label: "enableLogging", signature: "boolean enableLogging" },
];

const matchPrompts: MatchPrompt[] = [
  {
    id: "ui-family",
    prompt:
      "Your app needs Light Mode and Dark Mode component families across Buttons, TextFields, and Checkboxes.",
    answer: "Abstract Factory",
  },
  {
    id: "clone-blueprint",
    prompt:
      "Spawning obstacle entities via parsing is too expensive; you want to replicate an in-memory blueprint instead.",
    answer: "Prototype",
  },
  {
    id: "payload-parser",
    prompt:
      "Your router needs the right Parser for JSON, XML, or CSV without exposing the concrete parser classes.",
    answer: "Factory Method",
  },
];

const matchPatterns = ["Abstract Factory", "Prototype", "Factory Method"] as const;

const statusToneClass: Record<Tone, string> = {
  neutral: "border-zinc-800 text-zinc-400",
  good: "border-emerald-500/30 text-emerald-300",
  bad: "border-red-500/30 text-red-300",
  warn: "border-amber-500/30 text-amber-300",
};

function pass(title: string, detail: string, trace: string[], signals: Signal[]): LabResult {
  return { status: "pass", title, detail, trace, signals };
}

function fail(title: string, detail: string, trace: string[], signals: Signal[]): LabResult {
  return { status: "fail", title, detail, trace, signals };
}

function idle(title: string, detail: string, trace: string[], signals: Signal[]): LabResult {
  return { status: "idle", title, detail, trace, signals };
}

function combinations(features: BuilderFeature[]) {
  const total = 1 << features.length;
  return Array.from({ length: total }, (_, mask) => {
    const args = features
      .filter((_, index) => (mask & (1 << index)) !== 0)
      .map((feature) => feature.signature);
    return args.length === 0 ? "DatabaseConnection()" : `DatabaseConnection(${args.join(", ")})`;
  });
}

export function CreationalPatternsLab({ lessonId }: { lessonId: string }) {
  const { recordLabResult } = useCourseProgress();

  const [builderEnabled, setBuilderEnabled] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(builderFeatures.map((feature) => [feature.id, true])) as Record<
        string,
        boolean
      >,
  );
  const [builderView, setBuilderView] = useState(false);
  const [builderResult, setBuilderResult] = useState<LabResult>(
    idle(
      "Constructor matrix waiting",
      "Toggle configuration flags to see the overload count explode, then switch to the Builder view.",
      ["Start with the raw constructor approach.", "The count grows as you add more optional flags."],
      [
        { label: "Mode", value: "telescoping constructors", tone: "warn" },
        { label: "Build stage", value: "not collapsed yet", tone: "neutral" },
      ],
    ),
  );

  const [trafficMode, setTrafficMode] = useState<"raw" | "singleton">("raw");
  const [trafficResult, setTrafficResult] = useState<LabResult>(
    idle(
      "Traffic sandbox awaiting run",
      "Simulate 100 requests to see how raw instantiation exhausts the database or how a singleton protects it.",
      ["Choose raw instantiation or singleton reuse.", "Run the traffic simulator to inspect the connection graph."],
      [
        { label: "Connection policy", value: "raw new per request", tone: "warn" },
        { label: "Expected DB state", value: "unknown", tone: "neutral" },
      ],
    ),
  );

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [matchAssignments, setMatchAssignments] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(matchPrompts.map((prompt) => [prompt.id, null])) as Record<
      string,
      string | null
    >,
  );
  const [matchingResult, setMatchingResult] = useState<LabResult>(
    idle(
      "Matching board ready",
      "Drag the pattern tiles onto the prompts or tap a tile and then tap a prompt card.",
      ["Each prompt has a single correct pattern.", "Every answer should map to the pattern that solves the architectural breakdown."],
      [
        { label: "Matches", value: "0/3 placed", tone: "neutral" },
        { label: "Pattern bank", value: "all available", tone: "warn" },
      ],
    ),
  );

  const activeFeatureList = builderFeatures.filter((feature) => builderEnabled[feature.id]);
  const constructorCount = 1 << activeFeatureList.length;
  const constructorPreview = useMemo(
    () => combinations(activeFeatureList).slice(0, 10),
    [activeFeatureList],
  );
  const builderReady = builderView && activeFeatureList.length > 0;

  const builderSignals: Signal[] = [
    { label: "Active flags", value: String(activeFeatureList.length), tone: "good" as Tone },
    { label: "Constructor count", value: String(constructorCount), tone: "warn" as Tone },
    { label: "View", value: builderView ? "Builder" : "Telescoping", tone: builderView ? "good" : "warn" },
  ];

  const runBuilderCheck = () => {
    if (builderReady) {
      const next = pass(
        "Builder collapses constructor explosion",
        "The fluent builder keeps the public API stable even when configuration grows.",
        [
          `The active configuration space expands to ${constructorCount} valid combinations.`,
          "Builder view replaces the overload matrix with one fluent object graph.",
          "Constructor signatures no longer need to multiply as new flags appear.",
        ],
        builderSignals,
      );
      setBuilderResult(next);
      recordLabResult("lld", lessonId, "constructor-explosion", next.status);
      return;
    }

    const next = fail(
      "Telescoping constructors still multiply",
      "The engine still sees the raw constructor explosion and no builder collapse.",
      [
        "Keep the configuration switches visible.",
        "Unlock the Builder view to replace overloads with fluent steps.",
        "The constructor matrix should shrink back to one build path.",
      ],
      builderSignals,
    );
    setBuilderResult(next);
    recordLabResult("lld", lessonId, "constructor-explosion", next.status);
  };

  const runTrafficCheck = () => {
    if (trafficMode === "singleton") {
      const next = pass(
        "One socket survives the traffic burst",
        "100 requests reuse the shared connection instead of opening 100 separate sessions.",
        [
          "Requests fan into one shared DatabaseConnection instance.",
          "The Postgres node stays green because the connection pool is preserved.",
          "The simulated socket line multiplexes traffic instead of multiplying it.",
        ],
        [
          { label: "Requests", value: "100", tone: "good" },
          { label: "Live connections", value: "1 shared instance", tone: "good" },
          { label: "DB node", value: "stable", tone: "good" },
        ],
      );
      setTrafficResult(next);
      recordLabResult("lld", lessonId, "singleton-pool", next.status);
      return;
    }

    const next = fail(
      "Connection slots are exhausted",
      "Raw instantiation spins up a new database connection on every request and pushes Postgres into failure.",
      [
        "100 simulated requests each call new DatabaseConnection().",
        "The connection graph fans out into 100 active sessions.",
        "The Postgres node turns red and reports remaining connection slot exhaustion.",
      ],
      [
        { label: "Requests", value: "100", tone: "warn" },
        { label: "Live connections", value: "100", tone: "bad" },
        { label: "DB node", value: "FATAL: remaining connection slots are reserved", tone: "bad" },
      ],
    );
    setTrafficResult(next);
    recordLabResult("lld", lessonId, "singleton-pool", next.status);
  };

  const toggleMatch = (promptId: string, pattern: string) => {
    setMatchAssignments((current) => ({ ...current, [promptId]: pattern }));
    setSelectedPattern(null);
  };

  const runMatchingCheck = () => {
    const total = matchPrompts.length;
    const correct = matchPrompts.filter((prompt) => matchAssignments[prompt.id] === prompt.answer).length;
    const complete = correct === total;

    if (complete) {
      const next = pass(
        "Pattern matching challenge solved",
        "Each scenario now routes to the correct creational pattern.",
        [
          "Family creation maps to Abstract Factory.",
          "Blueprint cloning maps to Prototype.",
          "Parser selection maps to Factory Method.",
        ],
        [
          { label: "Correct matches", value: `${correct}/${total}`, tone: "good" },
          { label: "Pattern bank", value: "fully assigned", tone: "good" },
        ],
      );
      setMatchingResult(next);
      recordLabResult("lld", lessonId, "pattern-matching", next.status);
      return;
    }

    const next = fail(
      "Some architectural matches are still off",
      "The board still has at least one prompt mapped to the wrong creational pattern.",
      [
        "Light and dark component families need Abstract Factory.",
        "In-memory cloning blueprints need Prototype.",
        "Parser selection without exposed concretes needs Factory Method.",
      ],
      [
        { label: "Correct matches", value: `${correct}/${total}`, tone: correct > 0 ? "warn" : "bad" },
        { label: "Selected tile", value: selectedPattern ?? "none", tone: "neutral" },
      ],
    );
    setMatchingResult(next);
    recordLabResult("lld", lessonId, "pattern-matching", next.status);
  };

  return (
    <section className="my-8 overflow-hidden rounded-sm border border-zinc-800 bg-[#101010] font-mono">
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="text-[11px] uppercase tracking-widest text-amber-500/80">
          Creational Design Patterns
        </div>
        <h3 className="m-0 mt-1 border-0 p-0 text-base font-semibold text-zinc-100">
          Constructor pressure, lifecycle control, and pattern selection
        </h3>
        <p className="m-0 mt-2 max-w-3xl text-xs leading-5 text-zinc-500">
          Use these three scenarios to feel why `new` becomes a liability and why factories,
          builders, and singletons exist as architectural escape hatches.
        </p>
      </div>

      <div className="grid gap-4 p-4">
        <article className="border border-zinc-800 bg-[#0b0b0b] p-4">
          <div className="flex flex-col gap-3 border-b border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-500/70">
                Exercise 1
              </div>
              <h4 className="mt-1 text-sm font-semibold text-zinc-100">
                The Constructor Explosion Simulator
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Toggle optional connection settings to watch the overload matrix expand, then
                collapse it into a single fluent builder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBuilderView(true);
              }}
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Unlock Builder View
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3">
              <div className="border border-zinc-800 bg-[#111111] p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  DatabaseConnection options
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {builderFeatures.map((feature) => (
                    <label
                      key={feature.id}
                      className="flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
                    >
                      <input
                        type="checkbox"
                        checked={builderEnabled[feature.id]}
                        onChange={() =>
                          setBuilderEnabled((current) => ({
                            ...current,
                            [feature.id]: !current[feature.id],
                          }))
                        }
                        className="h-4 w-4 accent-amber-500"
                      />
                      <span>{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Active flags
                  </div>
                  <div className="mt-1 text-sm text-zinc-100">{activeFeatureList.length}</div>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Constructor count
                  </div>
                  <div className="mt-1 text-sm text-zinc-100">{constructorCount}</div>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Current view
                  </div>
                  <div className="mt-1 text-sm text-zinc-100">
                    {builderView ? "Builder" : "Telescoping"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#111111] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Generated constructors
                </div>
                <button
                  type="button"
                  onClick={runBuilderCheck}
                  className="border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
                >
                  Validate Design
                </button>
              </div>

              <div className="mt-3 max-h-56 overflow-auto border border-zinc-800 bg-black/30 p-3 text-xs leading-6 text-zinc-300">
                {constructorPreview.map((signature) => (
                  <div key={signature}>{signature}</div>
                ))}
                {activeFeatureList.length > 0 ? (
                  <div className="mt-2 text-zinc-500">
                    {constructorPreview.length < constructorCount
                      ? `+ ${constructorCount - constructorPreview.length} more overloads`
                      : "All overload combinations shown"}
                  </div>
                ) : (
                  <div className="text-zinc-500">No optional flags are active yet.</div>
                )}
              </div>

              <pre className="mt-3 overflow-auto border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-300">
{builderView
  ? `const connection = new ConnectionBuilder()
  .withSSL()
  .withTimeout(5000)
  .withReplica("replica.internal")
  .build();`
  : `new DatabaseConnection(
  useSSL,
  connectionTimeout,
  maxPoolSize,
  readReplicaHost,
  enableLogging
);`}
              </pre>
            </div>
          </div>

          <div className={`mt-4 border p-3 ${builderResult.status === "pass" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : builderResult.status === "fail" ? "border-red-500/30 bg-red-500/5 text-red-300" : "border-zinc-800 bg-zinc-950 text-zinc-400"}`}>
            <div className="text-sm font-semibold">{builderResult.title}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">{builderResult.detail}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {builderSignals.map((signal) => (
                <div
                  key={signal.label}
                  className={`border px-3 py-2 text-xs ${statusToneClass[signal.tone ?? "neutral"]}`}
                >
                  <div className="text-zinc-500">{signal.label}</div>
                  <div className="mt-1 text-current">{signal.value}</div>
                </div>
              ))}
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-current opacity-80">
              {builderResult.trace.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </article>

        <article className="border border-zinc-800 bg-[#0b0b0b] p-4">
          <div className="flex flex-col gap-3 border-b border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-500/70">
                Exercise 2
              </div>
              <h4 className="mt-1 text-sm font-semibold text-zinc-100">
                Connection Pool Exhaustion Sandbox
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Compare raw instantiation with a singleton-managed connection while 100 virtual
                requests hit the database.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTrafficMode("raw")}
                className={`border px-3 py-2 text-[11px] uppercase tracking-wider transition-colors ${
                  trafficMode === "raw"
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Raw new per request
              </button>
              <button
                type="button"
                onClick={() => setTrafficMode("singleton")}
                className={`border px-3 py-2 text-[11px] uppercase tracking-wider transition-colors ${
                  trafficMode === "singleton"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Singleton getInstance()
              </button>
              <button
                type="button"
                onClick={runTrafficCheck}
                className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
              >
                Simulate Traffic Run
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <div className="border border-zinc-800 bg-[#111111] p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Request handler
                </div>
                <pre className="mt-3 overflow-auto border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-300">
{trafficMode === "raw"
  ? `function handleRequest() {
  const db = new DatabaseConnection();
  db.query("SELECT 1");
}`
  : `function handleRequest() {
  const db = DatabaseConnection.getInstance();
  db.query("SELECT 1");
}`}
                </pre>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Virtual requests
                  </div>
                  <div className="mt-1 text-sm text-zinc-100">100</div>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Live connections
                  </div>
                  <div className="mt-1 text-sm text-zinc-100">
                    {trafficMode === "raw" ? "100" : "1"}
                  </div>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    DB status
                  </div>
                  <div className="mt-1 text-sm text-zinc-100">
                    {trafficMode === "raw" ? "FATAL" : "Healthy"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#111111] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Network chart
                </div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {trafficMode === "raw" ? "slot exhaustion" : "single shared socket"}
                </div>
              </div>
              <div
                className={`mt-3 grid min-h-48 gap-3 border p-3 ${
                  trafficMode === "raw"
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-emerald-500/20 bg-emerald-500/5"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-4 w-4 rounded-full ${
                        trafficMode === "raw" ? "bg-red-400/80" : "bg-emerald-400/80"
                      }`}
                      title={`request ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <div
                    className={`h-16 w-16 rounded-full border-2 ${
                      trafficMode === "raw"
                        ? "border-red-400/50 bg-red-500/10"
                        : "border-emerald-400/50 bg-emerald-500/10"
                    }`}
                  />
                  <div className="flex-1 border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
                    {trafficMode === "raw"
                      ? "Postgres saturates as every request opens a fresh connection."
                      : "All requests reuse one guarded connection and stay inside the pool."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 border p-3 ${trafficResult.status === "pass" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : trafficResult.status === "fail" ? "border-red-500/30 bg-red-500/5 text-red-300" : "border-zinc-800 bg-zinc-950 text-zinc-400"}`}>
            <div className="text-sm font-semibold">{trafficResult.title}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">{trafficResult.detail}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {trafficResult.signals.map((signal) => (
                <div
                  key={signal.label}
                  className={`border px-3 py-2 text-xs ${statusToneClass[signal.tone ?? "neutral"]}`}
                >
                  <div className="text-zinc-500">{signal.label}</div>
                  <div className="mt-1 text-current">{signal.value}</div>
                </div>
              ))}
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-current opacity-80">
              {trafficResult.trace.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </article>

        <article className="border border-zinc-800 bg-[#0b0b0b] p-4">
          <div className="flex flex-col gap-3 border-b border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-500/70">
                Exercise 3
              </div>
              <h4 className="mt-1 text-sm font-semibold text-zinc-100">
                Structural Matching Challenge
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Match each architectural description to the creational pattern that solves it.
                Drag a tile onto a prompt or tap first and then tap the target card.
              </p>
            </div>
            <button
              type="button"
              onClick={runMatchingCheck}
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Check Matches
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
            <div className="space-y-3">
              <div className="border border-zinc-800 bg-[#111111] p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Prompt board
                </div>
                <div className="mt-3 space-y-2">
                  {matchPrompts.map((prompt) => {
                    const current = matchAssignments[prompt.id];
                    const isCorrect = current === prompt.answer;
                    return (
                      <button
                        key={prompt.id}
                        type="button"
                        onClick={() => {
                          if (selectedPattern) {
                            toggleMatch(prompt.id, selectedPattern);
                          }
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const pattern = event.dataTransfer.getData("text/plain");
                          if (pattern) toggleMatch(prompt.id, pattern);
                        }}
                        className={`w-full border px-3 py-3 text-left transition-colors ${
                          isCorrect
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs leading-5 text-zinc-300">{prompt.prompt}</div>
                          <span className="shrink-0 border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500">
                            {current ?? "drop here"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border border-zinc-800 bg-[#111111] p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Pattern bank
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {matchPatterns.map((pattern) => {
                    const isSelected = selectedPattern === pattern;
                    return (
                      <button
                        key={pattern}
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", pattern);
                          setSelectedPattern(pattern);
                        }}
                        onClick={() => setSelectedPattern(pattern)}
                        className={`cursor-grab border px-3 py-2 text-xs uppercase tracking-wider transition-colors ${
                          isSelected
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        {pattern}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#111111] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Answer map
                </div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {Object.values(matchAssignments).filter(Boolean).length}/3 placed
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {matchPrompts.map((prompt) => {
                  const current = matchAssignments[prompt.id];
                  const isCorrect = current === prompt.answer;
                  return (
                    <div
                      key={prompt.id}
                      className={`border px-3 py-3 text-xs ${
                        isCorrect
                          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400"
                      }`}
                    >
                      <div className="text-zinc-500">{prompt.id}</div>
                      <div className="mt-1">{current ?? "unassigned"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`mt-4 border p-3 ${matchingResult.status === "pass" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : matchingResult.status === "fail" ? "border-red-500/30 bg-red-500/5 text-red-300" : "border-zinc-800 bg-zinc-950 text-zinc-400"}`}>
            <div className="text-sm font-semibold">{matchingResult.title}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">{matchingResult.detail}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {matchingResult.signals.map((signal) => (
                <div
                  key={signal.label}
                  className={`border px-3 py-2 text-xs ${statusToneClass[signal.tone ?? "neutral"]}`}
                >
                  <div className="text-zinc-500">{signal.label}</div>
                  <div className="mt-1 text-current">{signal.value}</div>
                </div>
              ))}
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-current opacity-80">
              {matchingResult.trace.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </article>
      </div>
    </section>
  );
}
