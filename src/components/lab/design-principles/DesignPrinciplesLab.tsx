"use client";

import React, { useMemo, useState } from "react";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";

type SignalTone = "neutral" | "good" | "bad" | "warn";

type Signal = {
  label: string;
  value: string;
  tone?: SignalTone;
};

type LabResult = {
  status: "idle" | "pass" | "fail";
  title: string;
  detail: string;
  trace: string[];
  signals: Signal[];
};

type LabConfig = {
  title: string;
  subtitle: string;
  goal: string;
  defaultCode: string;
  idleSignals: Signal[];
  run: (code: string) => LabResult;
};

type LabId = "srp" | "ocp" | "lsp" | "dip" | "dry" | "yagni";

type DesignPrinciplesLabProps = {
  lab: LabId;
  lessonId: string;
};

const pass = (
  title: string,
  detail: string,
  trace: string[],
  signals: Signal[],
): LabResult => ({ status: "pass", title, detail, trace, signals });

const fail = (
  title: string,
  detail: string,
  trace: string[],
  signals: Signal[],
): LabResult => ({ status: "fail", title, detail, trace, signals });

const has = (code: string, pattern: RegExp) => pattern.test(code);
const count = (code: string, pattern: RegExp) => code.match(pattern)?.length ?? 0;

const labs: Record<LabId, LabConfig> = {
  srp: {
    title: "Responsibility Boundary Scanner",
    subtitle: "Exercise 1.1: Refactoring a God Object",
    goal: "Split price calculation, inventory writes, and notifications into isolated modules.",
    defaultCode: `class OrderManager {
  double checkout(Order order) {
    double total = 0;
    for (Item item : order.items) {
      total += item.price * item.quantity;
    }

    db.execute("UPDATE inventory SET stock = stock - ?");
    logger.info("order=" + order.id + ", total=" + total);
    smtp.connect("mail.internal");
    smtp.send(order.customerEmail, "receipt");

    return total;
  }
}`,
    idleSignals: [
      { label: "Price logic", value: "inside OrderManager", tone: "bad" },
      { label: "Inventory schema", value: "inside OrderManager", tone: "bad" },
      { label: "SMTP payload", value: "inside OrderManager", tone: "bad" },
    ],
    run: (code) => {
      const hasPriceCalculator = has(code, /class\s+PriceCalculator/);
      const hasInventoryRepository = has(code, /class\s+InventoryRepository/);
      const hasNotificationService = has(code, /class\s+NotificationService/);
      const orderManagerHasSmtp = has(code, /class\s+OrderManager[\s\S]*(smtp|SMTP|send\s*\()/);
      const orderManagerHasSql = has(code, /class\s+OrderManager[\s\S]*(UPDATE\s+inventory|db\.execute)/);

      if (hasPriceCalculator && hasInventoryRepository && hasNotificationService && !orderManagerHasSmtp && !orderManagerHasSql) {
        return pass(
          "Responsibilities are isolated",
          "Notification payload changes and inventory schema changes no longer force edits to PriceCalculator.",
          [
            "PriceCalculator owns only cart math.",
            "InventoryRepository owns persistence and schema details.",
            "NotificationService owns email formatting and delivery.",
            "OrderManager now coordinates collaborators instead of absorbing every reason to change.",
          ],
          [
            { label: "PriceCalculator", value: "stable under notification mutation", tone: "good" },
            { label: "InventoryRepository", value: "absorbs stock schema changes", tone: "good" },
            { label: "NotificationService", value: "absorbs receipt payload changes", tone: "good" },
          ],
        );
      }

      return fail(
        "God object still has multiple reasons to change",
        "The scanner still finds pricing, persistence, or notification responsibilities fused together.",
        [
          "Create PriceCalculator for order total computation.",
          "Move inventory SQL into InventoryRepository.",
          "Move SMTP and receipt formatting into NotificationService.",
          "Keep OrderManager as orchestration only.",
        ],
        [
          { label: "PriceCalculator", value: hasPriceCalculator ? "found" : "missing", tone: hasPriceCalculator ? "good" : "bad" },
          { label: "InventoryRepository", value: hasInventoryRepository ? "found" : "missing", tone: hasInventoryRepository ? "good" : "bad" },
          { label: "NotificationService", value: hasNotificationService ? "found" : "missing", tone: hasNotificationService ? "good" : "bad" },
        ],
      );
    },
  },
  ocp: {
    title: "Extension Point Validator",
    subtitle: "Exercise 1.2: Killing the Conditional Ladder",
    goal: "Add UK tax behavior through a strategy without editing TaxProcessor for UK-specific logic.",
    defaultCode: `class TaxProcessor {
  double calculateTax(Invoice invoice) {
    switch (invoice.region) {
      case "US": return invoice.total * 0.07;
      case "EU": return invoice.total * 0.20;
      case "IN": return invoice.total * 0.18;
      default: return 0;
    }
  }
}`,
    idleSignals: [
      { label: "TaxProcessor", value: "switch ladder grows per region", tone: "bad" },
      { label: "UK region token", value: "would require core edit", tone: "bad" },
    ],
    run: (code) => {
      const hasStrategy = has(code, /interface\s+TaxStrategy/);
      const hasUkStrategy = has(code, /class\s+UKTaxStrategy\s+implements\s+TaxStrategy/);
      const processorBlock = code.match(/class\s+TaxProcessor[\s\S]*?(?=\nclass|\ninterface|$)/)?.[0] ?? "";
      const processorContainsUk = /UK/.test(processorBlock);
      const processorHasSwitch = /switch\s*\(/.test(processorBlock);
      const usesStrategy = /TaxStrategy/.test(processorBlock) && /(calculate\s*\(|calculateTax\s*\()/.test(processorBlock);

      if (hasStrategy && hasUkStrategy && usesStrategy && !processorContainsUk && !processorHasSwitch) {
        return pass(
          "Tax behavior is open for extension",
          "A UK region strategy can be registered without placing UK-specific branches inside TaxProcessor.",
          [
            "TaxStrategy defines the calculation contract.",
            "TaxProcessor depends on the abstraction.",
            "UKTaxStrategy adds new behavior as new code.",
            "The parser found no UK token inside TaxProcessor.",
          ],
          [
            { label: "TaxStrategy", value: "interface boundary found", tone: "good" },
            { label: "TaxProcessor", value: "closed to region edits", tone: "good" },
            { label: "UKTaxStrategy", value: "extension module found", tone: "good" },
          ],
        );
      }

      return fail(
        "Core tax logic still changes for new regions",
        "The validator expects strategy-based extension and no UK-specific branch inside TaxProcessor.",
        [
          "Define interface TaxStrategy.",
          "Make TaxProcessor call a TaxStrategy rather than switch on region.",
          "Add class UKTaxStrategy implements TaxStrategy.",
          "Keep the string UK out of TaxProcessor.",
        ],
        [
          { label: "TaxStrategy", value: hasStrategy ? "found" : "missing", tone: hasStrategy ? "good" : "bad" },
          { label: "TaxProcessor switch", value: processorHasSwitch ? "still present" : "removed", tone: processorHasSwitch ? "bad" : "good" },
          { label: "UK in TaxProcessor", value: processorContainsUk ? "found" : "absent", tone: processorContainsUk ? "bad" : "good" },
        ],
      );
    },
  },
  lsp: {
    title: "Substitution Contract Runner",
    subtitle: "Exercise 2.1: Fixing Broken Hierarchy Contracts",
    goal: "Split read and write contracts so read-only replicas are never forced to fake write support.",
    defaultCode: `abstract class DataStore {
  abstract Row read(String key);
  abstract void write(String key, Row row);
}

class ReadOnlyReplica extends DataStore {
  Row read(String key) {
    return replica.get(key);
  }

  void write(String key, Row row) {
    throw new UnsupportedOperationException();
  }
}`,
    idleSignals: [
      { label: "Base contract", value: "read + write fused", tone: "bad" },
      { label: "ReadOnlyReplica.write", value: "throws at runtime", tone: "bad" },
    ],
    run: (code) => {
      const hasReadable = has(code, /interface\s+ReadableStore/);
      const hasWritable = has(code, /interface\s+WritableStore/);
      const replicaImplementsReadable = has(code, /class\s+ReadOnlyReplica\s+implements\s+ReadableStore/);
      const throwsUnsupported = has(code, /UnsupportedOperationException|NotImplementedException|throw\s+new/);

      if (hasReadable && hasWritable && replicaImplementsReadable && !throwsUnsupported) {
        return pass(
          "Read-only replica is substitutable",
          "The mixed storage loop can treat replicas as readable stores without discovering fake write methods.",
          [
            "ReadableStore contains read behavior only.",
            "WritableStore contains mutation behavior separately.",
            "ReadOnlyReplica implements only what it can honor.",
            "No unsupported runtime write path remains.",
          ],
          [
            { label: "ReadableStore[] loop", value: "no runtime exceptions", tone: "good" },
            { label: "ReadOnlyReplica", value: "honest contract", tone: "good" },
            { label: "WritableStore", value: "separate mutation role", tone: "good" },
          ],
        );
      }

      return fail(
        "Subtype still weakens the base contract",
        "A consumer can still call a method that the child class cannot correctly support.",
        [
          "Create ReadableStore with read only.",
          "Create WritableStore with write only.",
          "Make ReadOnlyReplica implement ReadableStore only.",
          "Remove unsupported-operation throw paths.",
        ],
        [
          { label: "ReadableStore", value: hasReadable ? "found" : "missing", tone: hasReadable ? "good" : "bad" },
          { label: "WritableStore", value: hasWritable ? "found" : "missing", tone: hasWritable ? "good" : "bad" },
          { label: "Unsupported throw", value: throwsUnsupported ? "present" : "absent", tone: throwsUnsupported ? "bad" : "good" },
        ],
      );
    },
  },
  dip: {
    title: "Adapter Dependency Scanner",
    subtitle: "Exercise 2.2: Decoupling Hardcoded Adapters",
    goal: "Inject an IDatabaseAdapter into AnalyticsDashboard and test with a mock client.",
    defaultCode: `class AnalyticsDashboard {
  private PostgreSQLClient db;

  AnalyticsDashboard() {
    this.db = new PostgreSQLClient("prod.internal");
  }

  Report compile() {
    return Report.from(db.query("select * from events"));
  }
}`,
    idleSignals: [
      { label: "Constructor", value: "new PostgreSQLClient", tone: "bad" },
      { label: "Test path", value: "requires real database", tone: "bad" },
    ],
    run: (code) => {
      const hasAdapter = has(code, /interface\s+IDatabaseAdapter/);
      const injectedConstructor = has(code, /AnalyticsDashboard\s*\(\s*IDatabaseAdapter\s+\w+\s*\)/);
      const hasMock = has(code, /class\s+MockDatabaseAdapter\s+implements\s+IDatabaseAdapter/);
      const dashboardBlock = code.match(/class\s+AnalyticsDashboard[\s\S]*?(?=\nclass|\ninterface|$)/)?.[0] ?? "";
      const hardcodedClient = /new\s+PostgreSQLClient|PostgreSQLClient/.test(dashboardBlock);

      if (hasAdapter && injectedConstructor && hasMock && !hardcodedClient) {
        return pass(
          "Dashboard depends on an adapter contract",
          "The analytics compiler can run against a mock adapter without linking a concrete PostgreSQL client.",
          [
            "IDatabaseAdapter abstracts the query boundary.",
            "AnalyticsDashboard receives its dependency through the constructor.",
            "MockDatabaseAdapter can feed deterministic rows in tests.",
            "The dashboard source no longer references PostgreSQLClient.",
          ],
          [
            { label: "High-level module", value: "AnalyticsDashboard", tone: "good" },
            { label: "Dependency", value: "IDatabaseAdapter", tone: "good" },
            { label: "Test adapter", value: "MockDatabaseAdapter", tone: "good" },
          ],
        );
      }

      return fail(
        "Concrete adapter is still hardcoded",
        "The dashboard cannot be tested cleanly until it depends on an injected abstraction.",
        [
          "Define interface IDatabaseAdapter.",
          "Accept IDatabaseAdapter in the dashboard constructor.",
          "Remove PostgreSQLClient references from AnalyticsDashboard.",
          "Provide MockDatabaseAdapter for the test context.",
        ],
        [
          { label: "IDatabaseAdapter", value: hasAdapter ? "found" : "missing", tone: hasAdapter ? "good" : "bad" },
          { label: "Constructor injection", value: injectedConstructor ? "found" : "missing", tone: injectedConstructor ? "good" : "bad" },
          { label: "Concrete client in dashboard", value: hardcodedClient ? "present" : "absent", tone: hardcodedClient ? "bad" : "good" },
        ],
      );
    },
  },
  dry: {
    title: "Duplication Mutation Engine",
    subtitle: "Exercise 3.1: Structural De-duplication",
    goal: "Extract shared stream validation and hashing so both uploaders inherit one safety rule.",
    defaultCode: `class S3FileUploader {
  void upload(Stream input) {
    byte[] bytes = input.readAllBytes();
    if (bytes.length > 10485760) throw new Error("too large");
    String checksum = md5(bytes);
    s3.put(bytes, checksum);
  }
}

class DiskFileUploader {
  void upload(Stream input) {
    byte[] bytes = input.readAllBytes();
    if (bytes.length > 10485760) throw new Error("too large");
    String checksum = md5(bytes);
    disk.write(bytes, checksum);
  }
}`,
    idleSignals: [
      { label: "Buffer limit", value: "duplicated in two uploaders", tone: "bad" },
      { label: "Checksum flow", value: "duplicated in two uploaders", tone: "bad" },
    ],
    run: (code) => {
      const hasHelper = has(code, /class\s+(StreamValidator|UploadPreprocessor|StreamHasher)/);
      const limitCount = count(code, /10485760|MAX_BUFFER_SIZE/g);
      const uploaderLimitDuplicates = limitCount > 2;
      const helperMethod = has(code, /(validateAndHash|prepareUpload|readValidateAndHash)\s*\(/);
      const uploadersCallHelper = count(code, /\.(validateAndHash|prepareUpload|readValidateAndHash)\s*\(/g) >= 2;

      if (hasHelper && helperMethod && uploadersCallHelper && !uploaderLimitDuplicates) {
        return pass(
          "Shared knowledge has one representation",
          "Changing the buffer limit in the helper updates both S3 and disk upload paths immediately.",
          [
            "Stream reading, overflow checks, and hashing moved to a shared unit.",
            "S3FileUploader delegates preprocessing before storage.",
            "DiskFileUploader delegates preprocessing before storage.",
            "The mutation engine finds one safety limit owner.",
          ],
          [
            { label: "Shared helper", value: "owns validation and hashing", tone: "good" },
            { label: "S3FileUploader", value: "inherits safety rule", tone: "good" },
            { label: "DiskFileUploader", value: "inherits safety rule", tone: "good" },
          ],
        );
      }

      return fail(
        "Duplicated upload knowledge remains",
        "The same stream safety rule can still drift between uploaders.",
        [
          "Extract validation and hashing into a helper or base handler.",
          "Make both uploaders call the shared preprocessing path.",
          "Keep the maximum buffer size in one place.",
        ],
        [
          { label: "Shared helper", value: hasHelper ? "found" : "missing", tone: hasHelper ? "good" : "bad" },
          { label: "Helper calls", value: uploadersCallHelper ? "both uploaders call helper" : "missing from one or both", tone: uploadersCallHelper ? "good" : "bad" },
          { label: "Safety limit copies", value: String(limitCount), tone: uploaderLimitDuplicates ? "bad" : "warn" },
        ],
      );
    },
  },
  yagni: {
    title: "Speculative Scope Pruner",
    subtitle: "Exercise 3.2: YAGNI & KISS",
    goal: "Reduce an overbuilt feature flag service to the immediate synchronous configuration path.",
    defaultCode: `class FeatureFlagEngine {
  private GrpcStream stream;
  private RedisPool cachePool;
  private DistributedFallbackGraph fallbackGraph;
  private PluginRegistry<FlagAdapter> adapters;

  boolean enabled(String key, User user) {
    stream.open();
    cachePool.warm();
    fallbackGraph.rebalance();
    return adapters.resolve(user.team).evaluate(key, user);
  }
}`,
    idleSignals: [
      { label: "gRPC streaming", value: "unused for single team", tone: "bad" },
      { label: "Redis pooling", value: "speculative layer", tone: "bad" },
      { label: "Plugin registry", value: "future-proofing cost", tone: "bad" },
    ],
    run: (code) => {
      const hasSimpleChecker = has(code, /class\s+(FeatureFlagChecker|FeatureFlags|FlagConfig)/);
      const syncMethod = has(code, /boolean\s+(isEnabled|enabled)\s*\(\s*String\s+\w+\s*\)/);
      const forbidden = /Grpc|gRPC|Redis|Distributed|FallbackGraph|PluginRegistry|FlagAdapter|stream|cachePool/.test(code);
      const abstractionNoise = count(code, /interface\s+\w+|abstract\s+class\s+\w+/g);

      if (hasSimpleChecker && syncMethod && !forbidden && abstractionNoise <= 1) {
        return pass(
          "Architecture matches current scale",
          "The feature flag path compiles down to a synchronous lookup with no unused network or plugin infrastructure.",
          [
            "Removed streaming and distributed fallback layers.",
            "Removed Redis pooling from the single-team path.",
            "Kept one direct configuration lookup.",
            "The AST scanner found no dangling speculative adapters.",
          ],
          [
            { label: "Runtime path", value: "synchronous config check", tone: "good" },
            { label: "Network bindings", value: "none", tone: "good" },
            { label: "Abstraction noise", value: `${abstractionNoise} optional layer`, tone: "good" },
          ],
        );
      }

      return fail(
        "Speculative architecture still dominates the simple requirement",
        "The scanner rejects unused network bindings, redundant plugin hooks, and distributed fallback shells.",
        [
          "Keep a direct FeatureFlagChecker or FeatureFlags class.",
          "Expose a simple boolean enabled or isEnabled method.",
          "Remove gRPC, Redis, distributed fallback, and plugin registry code.",
          "Do not keep abstraction wrappers without a current caller.",
        ],
        [
          { label: "Simple checker", value: hasSimpleChecker ? "found" : "missing", tone: hasSimpleChecker ? "good" : "bad" },
          { label: "Forbidden speculative code", value: forbidden ? "present" : "absent", tone: forbidden ? "bad" : "good" },
          { label: "Abstract wrappers", value: String(abstractionNoise), tone: abstractionNoise > 1 ? "bad" : "warn" },
        ],
      );
    },
  },
};

const toneClass: Record<SignalTone, string> = {
  neutral: "border-zinc-800 text-zinc-400",
  good: "border-emerald-500/30 text-emerald-300",
  bad: "border-red-500/30 text-red-300",
  warn: "border-amber-500/30 text-amber-300",
};

export function DesignPrinciplesLab({ lab, lessonId }: DesignPrinciplesLabProps) {
  const config = labs[lab];
  const { recordLabResult } = useCourseProgress();
  const [code, setCode] = useState(config.defaultCode);
  const [result, setResult] = useState<LabResult>({
    status: "idle",
    title: "Analyzer idle",
    detail: config.goal,
    trace: ["Edit the code, then run the architecture check."],
    signals: config.idleSignals,
  });

  const statusClass = useMemo(() => {
    if (result.status === "pass") return "border-emerald-500/30 bg-emerald-500/5 text-emerald-300";
    if (result.status === "fail") return "border-red-500/30 bg-red-500/5 text-red-300";
    return "border-zinc-800 bg-zinc-950 text-zinc-400";
  }, [result.status]);

  return (
    <section className="my-8 overflow-hidden rounded-sm border border-zinc-800 bg-[#101010] font-mono">
      <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-amber-500/80">{config.title}</div>
          <h3 className="m-0 mt-1 border-0 p-0 text-base font-semibold text-zinc-100">{config.subtitle}</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = config.run(code);
            setResult(next);
            recordLabResult("lld", lessonId, lab, next.status);
          }}
          className="w-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20 md:w-auto"
        >
          Run Architecture Check
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-b border-zinc-800 lg:border-b-0 lg:border-r">
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            className="h-[420px] w-full resize-none bg-[#0b0b0b] p-4 text-sm leading-6 text-zinc-300 outline-none"
          />
        </div>

        <div className="flex min-h-[420px] flex-col">
          <div className={`m-4 border p-3 ${statusClass}`}>
            <div className="text-sm font-semibold">{result.title}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">{result.detail}</p>
          </div>

          <div className="px-4">
            <div className="mb-2 text-[11px] uppercase tracking-widest text-zinc-500">Architecture Signals</div>
            <div className="grid gap-2">
              {result.signals.map((signal) => (
                <div
                  key={`${signal.label}-${signal.value}`}
                  className={`grid grid-cols-[150px_1fr] gap-3 border bg-black/20 px-3 py-2 text-xs ${
                    toneClass[signal.tone ?? "neutral"]
                  }`}
                >
                  <span>{signal.label}</span>
                  <span>{signal.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex-1 border-t border-zinc-800 px-4 py-4">
            <div className="mb-2 text-[11px] uppercase tracking-widest text-zinc-500">Validation Trace</div>
            <ol className="m-0 list-decimal space-y-2 pl-4 text-xs leading-5 text-zinc-400">
              {result.trace.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
