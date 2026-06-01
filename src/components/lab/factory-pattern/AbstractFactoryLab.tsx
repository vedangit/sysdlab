"use client";

import { useState } from "react";
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

const toneClass: Record<Tone, string> = {
  neutral: "border-zinc-800 text-zinc-400",
  good: "border-emerald-500/30 text-emerald-300",
  bad: "border-red-500/30 text-red-300",
  warn: "border-amber-500/30 text-amber-300",
};

const pass = (title: string, detail: string, trace: string[], signals: Signal[]): LabResult => ({
  status: "pass",
  title,
  detail,
  trace,
  signals,
});

const fail = (title: string, detail: string, trace: string[], signals: Signal[]): LabResult => ({
  status: "fail",
  title,
  detail,
  trace,
  signals,
});

const idle = (title: string, detail: string, trace: string[], signals: Signal[]): LabResult => ({
  status: "idle",
  title,
  detail,
  trace,
  signals,
});

const has = (code: string, pattern: RegExp) => pattern.test(code);

function ThemeSurface({ theme }: { theme: "windows" | "mac" }) {
  const isWindows = theme === "windows";

  return (
    <div
      className={`border p-4 ${isWindows ? "border-sky-500/30 bg-sky-500/5" : "border-zinc-700 bg-zinc-950"}`}
    >
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">
        Active family
      </div>
      <h4 className={`mt-2 text-sm font-semibold ${isWindows ? "text-sky-200" : "text-zinc-100"}`}>
        {isWindows ? "Windows Theme" : "Mac Theme"}
      </h4>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className={`border px-3 py-2 text-xs ${isWindows ? "border-sky-500/20 bg-sky-500/10 text-sky-100" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
          Button
        </div>
        <div className={`border px-3 py-2 text-xs ${isWindows ? "border-sky-500/20 bg-sky-500/10 text-sky-100" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
          Checkbox
        </div>
      </div>

      <div className="mt-4 text-xs leading-6 text-zinc-500">
        Both widgets come from the same factory family, so the visual language stays aligned.
      </div>
    </div>
  );
}

export function AbstractFactoryLab({ lessonId }: { lessonId: string }) {
  const { recordLabResult } = useCourseProgress();
  const [theme, setTheme] = useState<"windows" | "mac">("windows");

  const [monolithCode, setMonolithCode] = useState(`class ThemeFactory {
  UIComponent create(String platform) {
    if (platform.equals("Windows")) {
      return new WindowsTheme();
    } else if (platform.equals("Mac")) {
      return new MacTheme();
    }
    return new LinuxTheme();
  }
}`);

  const [refactorCode, setRefactorCode] = useState(`interface UIFactory {
  Button createButton();
  Checkbox createCheckbox();
}

class WindowsFactory implements UIFactory {
  public Button createButton() { return new WindowsButton(); }
  public Checkbox createCheckbox() { return new WindowsCheckbox(); }
}

class MacFactory implements UIFactory {
  public Button createButton() { return new MacButton(); }
  public Checkbox createCheckbox() { return new MacCheckbox(); }
}

class AppRunner {
  public static UIFactory getFactory(String platform) {
    return switch (platform) {
      case "Windows" -> new WindowsFactory();
      case "Mac" -> new MacFactory();
      default -> throw new IllegalArgumentException("Unsupported platform");
    };
  }
}`);

  const [monolithResult, setMonolithResult] = useState<LabResult>(
    idle(
      "Monolith review waiting",
      "Add Linux support to the single factory and watch how the core class has to change.",
      ["This first step deliberately violates OCP.", "The goal is to feel the factory bloat before the refactor."],
      [
        { label: "Factory shape", value: "single monolith", tone: "warn" },
        { label: "OCP status", value: "fragile", tone: "bad" },
      ],
    ),
  );

  const [refactorResult, setRefactorResult] = useState<LabResult>(
    idle(
      "Abstract factory blueprint waiting",
      "Split the UI families into concrete factories and keep the platform selection at the top level.",
      ["The client should see UIFactory only.", "Windows and Mac should each supply a matching button + checkbox pair."],
      [
        { label: "Family design", value: "not compiled", tone: "neutral" },
        { label: "Theme preview", value: theme, tone: "warn" },
      ],
    ),
  );

  const runMonolithCheck = () => {
    const factoryExists = has(monolithCode, /class\s+ThemeFactory/);
    const hasWindows = has(monolithCode, /Windows/);
    const hasMac = has(monolithCode, /Mac/);
    const hasLinux = has(monolithCode, /Linux/);

    if (factoryExists && hasWindows && hasMac && hasLinux) {
      const next = pass(
        "Linux support works, but the factory grew again",
        "The change succeeded functionally, but it required editing the original ThemeFactory, which is exactly the OCP pain we want to remove.",
        [
          "A new family variant was added directly inside ThemeFactory.",
          "The core class had to change to support Linux.",
          "This is the signal to split into a higher-level abstract factory.",
        ],
        [
          { label: "ThemeFactory edits", value: "required", tone: "warn" },
          { label: "OCP outcome", value: "violated", tone: "bad" },
          { label: "Refactor cue", value: "yes", tone: "good" },
        ],
      );
      setMonolithResult(next);
      recordLabResult("lld", lessonId, "abstract-factory-monolith", next.status);
      return;
    }

    const next = fail(
      "The monolith still needs Linux support",
      "Either the Linux branch is missing or the single factory has not been updated yet.",
      [
        "Add the new Linux branch to the existing ThemeFactory.",
        "Notice how the original class must keep expanding for every new theme family.",
      ],
      [
        { label: "ThemeFactory", value: factoryExists ? "found" : "missing", tone: factoryExists ? "good" : "bad" },
        { label: "Windows branch", value: hasWindows ? "found" : "missing", tone: hasWindows ? "good" : "bad" },
        { label: "Linux branch", value: hasLinux ? "found" : "missing", tone: hasLinux ? "good" : "bad" },
      ],
    );
    setMonolithResult(next);
    recordLabResult("lld", lessonId, "abstract-factory-monolith", next.status);
  };

  const runRefactorCheck = () => {
    const hasInterface = has(refactorCode, /interface\s+UIFactory/);
    const hasWindowsFactory = has(refactorCode, /class\s+WindowsFactory\s+implements\s+UIFactory/);
    const hasMacFactory = has(refactorCode, /class\s+MacFactory\s+implements\s+UIFactory/);
    const hasAppRunner = has(refactorCode, /class\s+AppRunner/);
    const hasGetFactory = has(refactorCode, /getFactory\s*\(\s*String\s+platform\s*\)/);
    const hasNoFamilyNamesInClient =
      has(refactorCode, /UIFactory/) && has(refactorCode, /switch\s*\(\s*platform\s*\)/);

    if (hasInterface && hasWindowsFactory && hasMacFactory && hasAppRunner && hasGetFactory && hasNoFamilyNamesInClient) {
      const next = pass(
        "Abstract factory isolates the families",
        "The client only asks for UIFactory, and each platform family now stays internally consistent.",
        [
          "UIFactory defines the product family contract.",
          "WindowsFactory and MacFactory each produce matching widgets.",
          "AppRunner decides which concrete family to activate without exposing the constructor details to the UI layer.",
        ],
        [
          { label: "Client dependency", value: "UIFactory", tone: "good" },
          { label: "Family isolation", value: "complete", tone: "good" },
          { label: "OCP posture", value: "closed to modification", tone: "good" },
        ],
      );
      setRefactorResult(next);
      recordLabResult("lld", lessonId, "abstract-factory-refactor", next.status);
      return;
    }

    const next = fail(
      "The family split is incomplete",
      "The refactor still needs the abstract contract, concrete family factories, or a clean app entry point.",
      [
        "Add UIFactory with createButton and createCheckbox.",
        "Implement both WindowsFactory and MacFactory.",
        "Keep the platform selection in AppRunner rather than scattering it through the UI code.",
      ],
      [
        { label: "UIFactory", value: hasInterface ? "present" : "missing", tone: hasInterface ? "good" : "bad" },
        { label: "WindowsFactory", value: hasWindowsFactory ? "present" : "missing", tone: hasWindowsFactory ? "good" : "bad" },
        { label: "MacFactory", value: hasMacFactory ? "present" : "missing", tone: hasMacFactory ? "good" : "bad" },
      ],
    );
    setRefactorResult(next);
    recordLabResult("lld", lessonId, "abstract-factory-refactor", next.status);
  };

  return (
    <section className="my-8 overflow-hidden rounded-sm border border-zinc-800 bg-[#101010] font-mono">
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="text-[11px] uppercase tracking-widest text-amber-500/80">
          Abstract Factory Pattern
        </div>
        <h3 className="m-0 mt-1 border-0 p-0 text-base font-semibold text-zinc-100">
          Factory families, theme consistency, and client isolation
        </h3>
        <p className="m-0 mt-2 max-w-3xl text-xs leading-5 text-zinc-500">
          Start with a bloated monolithic theme factory, then split it into family-specific
          factories that keep related products aligned without changing the UI client.
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
                Breaking the Single Factory
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Add Linux support to the monolithic ThemeFactory and see why the core factory
                class becomes a permanent modification hotspot.
              </p>
            </div>
            <button
              type="button"
              onClick={runMonolithCheck}
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Validate Monolith
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                ThemeFactory source
              </div>
              <textarea
                value={monolithCode}
                onChange={(event) => setMonolithCode(event.target.value)}
                className="mt-3 min-h-72 w-full border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-300 outline-none transition-colors focus:border-amber-500/40"
              />
            </div>

            <div className="space-y-3">
              <div className="border border-zinc-800 bg-zinc-950 p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Validation snapshot
                </div>
                <pre className="mt-3 overflow-auto text-xs leading-6 text-zinc-300">
{`ThemeFactory -> Windows / Mac / Linux
The more families you add, the more this class changes.`}
                </pre>
              </div>

              <div
                className={`border p-3 ${
                  monolithResult.status === "pass"
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                    : monolithResult.status === "fail"
                      ? "border-red-500/30 bg-red-500/5 text-red-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400"
                }`}
              >
                <div className="text-sm font-semibold">{monolithResult.title}</div>
                <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">
                  {monolithResult.detail}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {monolithResult.signals.map((signal) => (
                    <div
                      key={signal.label}
                      className={`border px-3 py-2 text-xs ${toneClass[signal.tone ?? "neutral"]}`}
                    >
                      <div className="text-zinc-500">{signal.label}</div>
                      <div className="mt-1 text-current">{signal.value}</div>
                    </div>
                  ))}
                </div>
                <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-current opacity-80">
                  {monolithResult.trace.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </article>

        <article className="border border-zinc-800 bg-[#0b0b0b] p-4">
          <div className="flex flex-col gap-3 border-b border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-500/70">
                Exercise 2
              </div>
              <h4 className="mt-1 text-sm font-semibold text-zinc-100">
                Refactoring to Abstract Factory
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Implement UIFactory, separate WindowsFactory and MacFactory, and keep the platform
                selection in AppRunner only.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTheme("windows")}
                className={`border px-3 py-2 text-[11px] uppercase tracking-wider transition-colors ${
                  theme === "windows"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Switch to Windows Theme
              </button>
              <button
                type="button"
                onClick={() => setTheme("mac")}
                className={`border px-3 py-2 text-[11px] uppercase tracking-wider transition-colors ${
                  theme === "mac"
                    ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-200"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Switch to Mac Theme
              </button>
              <button
                type="button"
                onClick={runRefactorCheck}
                className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
              >
                Compile Family Split
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                Abstract factory source
              </div>
              <textarea
                value={refactorCode}
                onChange={(event) => setRefactorCode(event.target.value)}
                className="mt-3 min-h-72 w-full border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-300 outline-none transition-colors focus:border-amber-500/40"
              />
            </div>

            <div className="space-y-3">
              <ThemeSurface theme={theme} />

              <div
                className={`border p-3 ${
                  refactorResult.status === "pass"
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                    : refactorResult.status === "fail"
                      ? "border-red-500/30 bg-red-500/5 text-red-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400"
                }`}
              >
                <div className="text-sm font-semibold">{refactorResult.title}</div>
                <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">
                  {refactorResult.detail}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {refactorResult.signals.map((signal) => (
                    <div
                      key={signal.label}
                      className={`border px-3 py-2 text-xs ${toneClass[signal.tone ?? "neutral"]}`}
                    >
                      <div className="text-zinc-500">{signal.label}</div>
                      <div className="mt-1 text-current">{signal.value}</div>
                    </div>
                  ))}
                </div>
                <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-current opacity-80">
                  {refactorResult.trace.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
