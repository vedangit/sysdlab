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
const count = (code: string, pattern: RegExp) => code.match(pattern)?.length ?? 0;

function ResultCard({ result }: { result: LabResult }) {
  return (
    <div
      className={`border p-3 ${
        result.status === "pass"
          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
          : result.status === "fail"
            ? "border-red-500/30 bg-red-500/5 text-red-300"
            : "border-zinc-800 bg-zinc-950 text-zinc-400"
      }`}
    >
      <div className="text-sm font-semibold">{result.title}</div>
      <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">{result.detail}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {result.signals.map((signal) => (
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
        {result.trace.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </div>
  );
}

export function BuilderPatternLab({ lessonId }: { lessonId: string }) {
  const { recordLabResult } = useCourseProgress();

  const [notificationCode, setNotificationCode] = useState(`class NotificationConfig {
  private final String host;
  private final int port;
  private final boolean sslEnabled;
  private final int retryCount;
  private final int timeout;
  private final boolean keepAlive;

  public NotificationConfig(String host) { this(host, 25); }
  public NotificationConfig(String host, int port) { this(host, port, false); }
  public NotificationConfig(String host, int port, boolean sslEnabled) { this(host, port, sslEnabled, 3); }
  public NotificationConfig(String host, int port, boolean sslEnabled, int retryCount) { this(host, port, sslEnabled, retryCount, 5000); }
  public NotificationConfig(String host, int port, boolean sslEnabled, int retryCount, int timeout) {
    this.host = host;
    this.port = port;
    this.sslEnabled = sslEnabled;
    this.retryCount = retryCount;
    this.timeout = timeout;
    this.keepAlive = true;
  }
}`);

  const [httpRequestCode, setHttpRequestCode] = useState(`class HttpRequestBuilder {
  private String method = "GET";
  private String url;
  private String body;

  public HttpRequestBuilder method(String method) { this.method = method; return this; }
  public HttpRequestBuilder url(String url) { this.url = url; return this; }
  public HttpRequestBuilder body(String body) { this.body = body; return this; }

  public HttpRequest build() {
    if (!url.startsWith("https")) {
      throw new IllegalStateException("Only HTTPS is allowed");
    }
    if ((method.equals("POST") || method.equals("PUT")) && body == null) {
      throw new IllegalStateException("Body required for write methods");
    }
    return new HttpRequest(method, url, body);
  }
}`);

  const [userProfileCode, setUserProfileCode] = useState(`class UserProfile {
  private final String name;
  private final String email;
  private final int age;
  private final String avatarUrl;

  private UserProfile(Builder builder) {
    this.name = builder.name;
    this.email = builder.email;
    this.age = builder.age;
    this.avatarUrl = builder.avatarUrl;
  }

  static class Builder {
    private String name = "Guest";
    private String email = "";
    private int age = 0;
    private String avatarUrl = "";

    Builder name(String value) { this.name = value; return this; }
    Builder email(String value) { this.email = value; return this; }
    Builder age(int value) { this.age = value; return this; }
    Builder avatarUrl(String value) { this.avatarUrl = value; return this; }

    UserProfile build() { return new UserProfile(this); }
  }
}`);

  const [notificationResult, setNotificationResult] = useState<LabResult>(
    idle(
      "Builder refactor waiting",
      "Replace the constructor ladder with a single private constructor and a fluent Builder.",
      ["The point is to stop exposing every optional permutation as a separate constructor.", "Builder should hold defaults until build() freezes them."],
      [
        { label: "Constructors", value: "overloaded", tone: "warn" },
        { label: "Builder", value: "missing", tone: "neutral" },
        { label: "Immutability", value: "partial", tone: "warn" },
      ],
    ),
  );

  const [requestResult, setRequestResult] = useState<LabResult>(
    idle(
      "Invariant check waiting",
      "The build step should validate required fields before allocating the request object.",
      ["POST and PUT need a body.", "The URL must remain HTTPS-only."],
      [
        { label: "URL policy", value: "unchecked", tone: "neutral" },
        { label: "Write method body rule", value: "unchecked", tone: "neutral" },
      ],
    ),
  );

  const [profileResult, setProfileResult] = useState<LabResult>(
    idle(
      "Immutability check waiting",
      "Seal the entity after build() so the object becomes read-only to client code.",
      ["Fields should be final.", "Setter methods should disappear from the root class."],
      [
        { label: "Setter surface", value: "present", tone: "warn" },
        { label: "Final fields", value: "partial", tone: "warn" },
      ],
    ),
  );

  const runNotificationCheck = () => {
    const constructorCount = count(notificationCode, /NotificationConfig\s*\(/g);
    const hasPrivateBuilderCtor = has(
      notificationCode,
      /private\s+NotificationConfig\s*\(\s*Builder\s+builder\s*\)/,
    );
    const hasStaticBuilder = has(notificationCode, /static\s+class\s+Builder/);
    const hasBuild = has(notificationCode, /build\s*\(\s*\)/);
    const hasReturnsThis = count(notificationCode, /return\s+this\s*;/g) >= 3;
    const hasFluentSample = has(notificationCode, /new\s+NotificationConfig\.Builder/);

    if (
      constructorCount === 1 &&
      hasPrivateBuilderCtor &&
      hasStaticBuilder &&
      hasBuild &&
      hasReturnsThis &&
      hasFluentSample
    ) {
      const next = pass(
        "Telescoping constructors collapse into one builder",
        "The NotificationConfig API now exposes a single private construction path and a fluent builder for the optional fields.",
        [
          "Optional values live in the Builder until build() commits them.",
          "Only one constructor remains visible to the target class.",
          "The caller can see which option is being configured at every step.",
        ],
        [
          { label: "Constructor shape", value: "single private path", tone: "good" },
          { label: "Chaining", value: "enabled", tone: "good" },
          { label: "Optional config", value: "readable", tone: "good" },
        ],
      );
      setNotificationResult(next);
      recordLabResult("lld", lessonId, "builder-telescoping", next.status);
      return;
    }

    const next = fail(
      "The constructor ladder still leaks through",
      "Keep only one private constructor and route every optional setting through the Builder.",
      [
        "Remove the overload stack.",
        "Add a static Builder inner class.",
        "Make each builder method return this so chaining stays fluent.",
      ],
      [
        { label: "Constructor count", value: String(constructorCount), tone: constructorCount > 1 ? "bad" : "warn" },
        { label: "Private builder ctor", value: hasPrivateBuilderCtor ? "found" : "missing", tone: hasPrivateBuilderCtor ? "good" : "bad" },
        { label: "Fluent chaining", value: hasReturnsThis ? "present" : "missing", tone: hasReturnsThis ? "good" : "bad" },
      ],
    );
    setNotificationResult(next);
    recordLabResult("lld", lessonId, "builder-telescoping", next.status);
  };

  const runRequestCheck = () => {
    const hasHttpsGuard = has(httpRequestCode, /!url\.startsWith\(\s*["']https["']\s*\)/);
    const hasIllegalState = has(httpRequestCode, /throw\s+new\s+IllegalStateException/);
    const hasWriteRule =
      has(httpRequestCode, /method\.equals\(\s*["']POST["']\s*\)\s*\|\|\s*method\.equals\(\s*["']PUT["']\s*\)/) ||
      has(httpRequestCode, /POST.*PUT|PUT.*POST/);
    const hasBodyRule = has(httpRequestCode, /body\s*==\s*null/);
    const hasBuild = has(httpRequestCode, /build\s*\(\s*\)/);

    if (hasBuild && hasHttpsGuard && hasIllegalState && hasWriteRule && hasBodyRule) {
      const next = pass(
        "Builder validation blocks invalid request state",
        "The builder now rejects insecure URLs and missing bodies before the HttpRequest is allocated.",
        [
          "build() becomes the gatekeeper for invariants.",
          "The object cannot exist in an invalid state.",
          "Write methods require payload data and HTTPS remains mandatory.",
        ],
        [
          { label: "HTTPS guard", value: "present", tone: "good" },
          { label: "Write body guard", value: "present", tone: "good" },
          { label: "Allocation timing", value: "after validation", tone: "good" },
        ],
      );
      setRequestResult(next);
      recordLabResult("lld", lessonId, "builder-invariants", next.status);
      return;
    }

    const next = fail(
      "The builder still allows unsafe requests",
      "Add explicit validation inside build() before creating HttpRequest.",
      [
        "Require HTTPS in the URL.",
        "Reject POST and PUT when body is missing.",
        "Throw IllegalStateException from build() when validation fails.",
      ],
      [
        { label: "HTTPS guard", value: hasHttpsGuard ? "found" : "missing", tone: hasHttpsGuard ? "good" : "bad" },
        { label: "Body guard", value: hasBodyRule ? "found" : "missing", tone: hasBodyRule ? "good" : "bad" },
        { label: "Exception path", value: hasIllegalState ? "found" : "missing", tone: hasIllegalState ? "good" : "bad" },
      ],
    );
    setRequestResult(next);
    recordLabResult("lld", lessonId, "builder-invariants", next.status);
  };

  const runProfileCheck = () => {
    const hasFinalFields = count(userProfileCode, /\bfinal\b/g) >= 4;
    const hasPrivateCtor = has(userProfileCode, /private\s+UserProfile\s*\(\s*Builder\s+builder\s*\)/);
    const hasStaticBuilder = has(userProfileCode, /static\s+class\s+Builder/);
    const hasNoSetter = !has(userProfileCode, /\bset[A-Z]\w*\s*\(/);
    const hasBuild =
      has(userProfileCode, /UserProfile\s+build\s*\(\s*\)/) &&
      has(userProfileCode, /return\s+new\s+UserProfile\(this\)\s*;/);

    if (hasFinalFields && hasPrivateCtor && hasStaticBuilder && hasNoSetter && hasBuild) {
      const next = pass(
        "UserProfile is immutable after build()",
        "The public setter surface is gone, and the entity is now sealed behind final fields plus a private constructor.",
        [
          "The outer object no longer exposes state mutation.",
          "Builder defaults live separately from the immutable entity.",
          "Once build() returns, the profile becomes read-only by design.",
        ],
        [
          { label: "Final fields", value: "locked", tone: "good" },
          { label: "Public setters", value: "none", tone: "good" },
          { label: "Post-build state", value: "immutable", tone: "good" },
        ],
      );
      setProfileResult(next);
      recordLabResult("lld", lessonId, "builder-immutability", next.status);
      return;
    }

    const next = fail(
      "The entity still mutates too easily",
      "Keep the state inside final fields, remove setters from the root class, and let the Builder create the object once.",
      [
        "Make the outer class immutable.",
        "Move optional defaults into the Builder.",
        "Avoid exposing setX() methods from UserProfile itself.",
      ],
      [
        { label: "Final fields", value: hasFinalFields ? "present" : "missing", tone: hasFinalFields ? "good" : "bad" },
        { label: "Setter surface", value: hasNoSetter ? "clean" : "still exposed", tone: hasNoSetter ? "good" : "bad" },
        { label: "Private constructor", value: hasPrivateCtor ? "found" : "missing", tone: hasPrivateCtor ? "good" : "bad" },
      ],
    );
    setProfileResult(next);
    recordLabResult("lld", lessonId, "builder-immutability", next.status);
  };

  return (
    <section className="my-8 overflow-hidden rounded-sm border border-zinc-800 bg-[#101010] font-mono">
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="text-[11px] uppercase tracking-widest text-amber-500/80">
          Builder Pattern
        </div>
        <h3 className="m-0 mt-1 border-0 p-0 text-base font-semibold text-zinc-100">
          Fluent construction, invariant checks, and immutable objects
        </h3>
        <p className="m-0 mt-2 max-w-3xl text-xs leading-5 text-zinc-500">
          Use the three drills below to feel why telescoping constructors break down, how build()
          becomes the validation checkpoint, and why builders pair naturally with immutable state.
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
                Refactor the constructor ladder
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Collapse the overloaded NotificationConfig constructors into one private constructor
                plus a fluent Builder.
              </p>
            </div>
            <button
              type="button"
              onClick={runNotificationCheck}
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Validate Builder Refactor
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                NotificationConfig source
              </div>
              <textarea
                value={notificationCode}
                onChange={(event) => setNotificationCode(event.target.value)}
                className="mt-3 min-h-72 w-full border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-300 outline-none transition-colors focus:border-amber-500/40"
              />
            </div>
            <div className="space-y-3">
              <div className="border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-400">
                Telescoping constructors multiply quickly when each optional field needs a separate
                positional signature. A builder turns those permutations into named steps.
              </div>
              <ResultCard result={notificationResult} />
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
                Validate object state before allocation
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Add build-time checks so invalid request chains throw before HttpRequest is created.
              </p>
            </div>
            <button
              type="button"
              onClick={runRequestCheck}
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Run Invariant Check
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                HttpRequestBuilder source
              </div>
              <textarea
                value={httpRequestCode}
                onChange={(event) => setHttpRequestCode(event.target.value)}
                className="mt-3 min-h-72 w-full border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-300 outline-none transition-colors focus:border-amber-500/40"
              />
            </div>
            <div className="space-y-3">
              <div className="border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-400">
                The builder is the right place for contract checks: once build() passes, the object
                should already satisfy its invariants.
              </div>
              <ResultCard result={requestResult} />
            </div>
          </div>
        </article>

        <article className="border border-zinc-800 bg-[#0b0b0b] p-4">
          <div className="flex flex-col gap-3 border-b border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-500/70">
                Exercise 3
              </div>
              <h4 className="mt-1 text-sm font-semibold text-zinc-100">
                Seal the entity after build()
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Refactor UserProfile into an immutable object with final fields and no public setter
                surface on the root class.
              </p>
            </div>
            <button
              type="button"
              onClick={runProfileCheck}
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Verify Immutability
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                UserProfile source
              </div>
              <textarea
                value={userProfileCode}
                onChange={(event) => setUserProfileCode(event.target.value)}
                className="mt-3 min-h-72 w-full border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-300 outline-none transition-colors focus:border-amber-500/40"
              />
            </div>
            <div className="space-y-3">
              <div className="border border-zinc-800 bg-zinc-950 p-3 text-xs leading-6 text-zinc-400">
                Builders are a strong fit for immutable domain entities because they gather optional
                inputs up front and hand over a finished object that should no longer mutate.
              </div>
              <ResultCard result={profileResult} />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
