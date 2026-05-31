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

export function FactoryPatternLab({ lessonId }: { lessonId: string }) {
  const { recordLabResult } = useCourseProgress();

  const [clientCode, setClientCode] = useState(`enum VehicleType {
  CAR,
  TRUCK
}

interface Vehicle {
  void drive();
}

class Car implements Vehicle {
  public void drive() {}
}

class Truck implements Vehicle {
  public void drive() {}
}

class Client {
  Vehicle createFleetVehicle(VehicleType type) {
    if (type == VehicleType.CAR) {
      return new Car();
    }
    return new Truck();
  }
}`);

  const [factoryCode, setFactoryCode] = useState(`class VehicleFactory {
  static Vehicle getVehicle(VehicleType type) {
    return switch (type) {
      case CAR -> new Car();
      case TRUCK -> new Truck();
    };
  }
}`);

  const [rawServicesCode, setRawServicesCode] = useState(`class BillingService {
  DatabaseConnector connector = new DatabaseConnector();
}

class ReportingService {
  DatabaseConnector connector = new DatabaseConnector();
}

class SyncService {
  DatabaseConnector connector = new DatabaseConnector();
}`);

  const [factoryServicesCode, setFactoryServicesCode] = useState(`class ConnectorFactory {
  static DatabaseConnector create(SecurityToken token) {
    return new DatabaseConnector(token);
  }
}

class BillingService {
  DatabaseConnector connector = ConnectorFactory.create(securityToken);
}

class ReportingService {
  DatabaseConnector connector = ConnectorFactory.create(securityToken);
}

class SyncService {
  DatabaseConnector connector = ConnectorFactory.create(securityToken);
}`);

  const [nightmareMode, setNightmareMode] = useState<"raw" | "factory">("raw");
  const [registryCode, setRegistryCode] = useState(`class VehicleFactory {
  private final Map<String, Supplier<Vehicle>> registry = new HashMap<>();

  VehicleFactory() {
    registry.put("Car", Car::new);
    registry.put("Truck", Truck::new);
  }

  Vehicle getVehicle(String type) {
    Supplier<Vehicle> constructor = registry.get(type);
    if (constructor == null) {
      throw new IllegalArgumentException("Unknown type: " + type);
    }
    return constructor.get();
  }

  void registerVehicle(String type, Supplier<Vehicle> constructor) {
    registry.put(type, constructor);
  }
}`);

  const [pluginCode, setPluginCode] = useState(`class ElectricBike implements Vehicle {
  public void drive() {}
}

factory.registerVehicle("ElectricBike", ElectricBike::new);
Vehicle bike = factory.getVehicle("ElectricBike");`);

  const [resultOne, setResultOne] = useState<LabResult>(
    idle(
      "Client refactor waiting",
      "Move object creation out of the client and into the factory.",
      ["The client should request vehicles by type.", "The factory should own the concrete constructors."],
      [
        { label: "Client coupling", value: "still direct", tone: "warn" },
        { label: "Factory state", value: "incomplete", tone: "neutral" },
      ],
    ),
  );
  const [resultTwo, setResultTwo] = useState<LabResult>(
    idle(
      "Nightmare refactor waiting",
      "Switch between the broken version and the factory-backed version to see how one change ripples differently.",
      ["The raw phase needs three files edited.", "The factory phase should centralize the token once."],
      [
        { label: "Phase", value: "raw design", tone: "warn" },
        { label: "Files touched", value: "3", tone: "warn" },
      ],
    ),
  );
  const [resultThree, setResultThree] = useState<LabResult>(
    idle(
      "Registry lab waiting",
      "Replace the hardcoded switch with a dynamic registry and add ElectricBike from an external block.",
      ["The registry should use Map<String, Supplier<Vehicle>>.", "External registration should happen without editing the factory body."],
      [
        { label: "Registry mode", value: "static switch", tone: "warn" },
        { label: "Plugin", value: "not registered", tone: "neutral" },
      ],
    ),
  );

  const runCentralizationCheck = () => {
    const hasEnum = has(clientCode, /enum\s+VehicleType/);
    const clientUsesFactory = has(clientCode, /VehicleFactory\.getVehicle\s*\(\s*VehicleType\.CAR\s*\)/);
    const clientHasDirectNew = has(clientCode, /new\s+Car\s*\(|new\s+Truck\s*\(/);
    const factoryHasVehicleFactory = has(factoryCode, /class\s+VehicleFactory/);
    const factoryHasSwitch = has(factoryCode, /switch\s*\(\s*type\s*\)/) || has(factoryCode, /return\s+switch\s*\(\s*type\s*\)/);
    const factoryCreatesVariants = has(factoryCode, /new\s+Car\s*\(/) && has(factoryCode, /new\s+Truck\s*\(/);

    if (hasEnum && clientUsesFactory && !clientHasDirectNew && factoryHasVehicleFactory && factoryHasSwitch && factoryCreatesVariants) {
      const next = pass(
        "Creation logic is centralized",
        "The client now asks for vehicles through the factory, and the factory owns the concrete constructors.",
        [
          "VehicleType drives selection instead of concrete class names.",
          "Client code no longer instantiates Car or Truck directly.",
          "VehicleFactory absorbs constructor changes in one place.",
        ],
        [
          { label: "Client new() calls", value: "0", tone: "good" },
          { label: "Factory responsibility", value: "select + instantiate", tone: "good" },
          { label: "Pattern goal", value: "decoupled creation", tone: "good" },
        ],
      );
      setResultOne(next);
      recordLabResult("lld", lessonId, "factory-centralization", next.status);
      return;
    }

    const next = fail(
      "Client creation is still coupled",
      "The client still owns at least part of the construction logic or the factory is incomplete.",
      [
        "Add VehicleType so callers can request a variant by identifier.",
        "Replace direct new Car()/new Truck() in Client with VehicleFactory.getVehicle(...).",
        "Keep the constructor branching inside VehicleFactory.",
      ],
      [
        { label: "Enum selector", value: hasEnum ? "found" : "missing", tone: hasEnum ? "good" : "bad" },
        { label: "Client factory call", value: clientUsesFactory ? "present" : "missing", tone: clientUsesFactory ? "good" : "bad" },
        { label: "Direct new in client", value: clientHasDirectNew ? "found" : "removed", tone: clientHasDirectNew ? "bad" : "good" },
      ],
    );
    setResultOne(next);
    recordLabResult("lld", lessonId, "factory-centralization", next.status);
  };

  const runNightmareCheck = () => {
    const currentCode = nightmareMode === "raw" ? rawServicesCode : factoryServicesCode;
    const directConnectorCount = count(currentCode, /new\s+DatabaseConnector\s*\(/g);
    const tokenCount = count(currentCode, /SecurityToken/g);
    const usesFactory = has(currentCode, /ConnectorFactory\.create\s*\(\s*securityToken\s*\)/);
    const hasSharedFactory = has(currentCode, /class\s+ConnectorFactory/);
    const fileCount = nightmareMode === "raw" ? 3 : 1;

    if (nightmareMode === "raw") {
      if (directConnectorCount >= 3 && tokenCount >= 3) {
        const next = pass(
          "All three services were patched manually",
          "The raw design now compiles, but only after each service file was edited to absorb the constructor change.",
          [
            "The constructor change hit every service directly.",
            "Three files needed a token-aware edit path.",
            "This is exactly the rigidity the factory pattern tries to avoid.",
          ],
          [
            { label: "Files edited", value: String(fileCount), tone: "warn" },
            { label: "Direct connector calls", value: String(directConnectorCount), tone: "warn" },
            { label: "SecurityToken mentions", value: String(tokenCount), tone: "good" },
          ],
        );
        setResultTwo(next);
        recordLabResult("lld", lessonId, "factory-nightmare", next.status);
        return;
      }

      const next = fail(
        "Raw design still breaks in multiple places",
        "The three services still depend on direct connector construction, so the constructor change keeps spreading.",
        [
          "The SecurityToken requirement ripples into every service.",
          "Without a factory, each service must learn the new constructor signature.",
          "Patch all three call sites or move creation behind ConnectorFactory.",
        ],
        [
          { label: "Phase", value: "raw design", tone: "bad" },
          { label: "Files to edit", value: "3", tone: "warn" },
          { label: "Tokenized constructors", value: String(tokenCount), tone: tokenCount > 0 ? "good" : "bad" },
        ],
      );
      setResultTwo(next);
      recordLabResult("lld", lessonId, "factory-nightmare", next.status);
      return;
    }

    if (usesFactory && hasSharedFactory && tokenCount >= 1 && directConnectorCount === 1) {
      const next = pass(
        "One factory change fixes the system",
        "The SecurityToken flows through ConnectorFactory once, and the services stay thin.",
        [
          "ConnectorFactory owns connector creation.",
          "Services only ask the factory for a connector.",
          "A future constructor change touches one place instead of three.",
        ],
        [
          { label: "Files edited", value: String(fileCount), tone: "good" },
          { label: "Factory indirection", value: "present", tone: "good" },
          { label: "Token handling", value: "centralized", tone: "good" },
        ],
      );
      setResultTwo(next);
      recordLabResult("lld", lessonId, "factory-nightmare", next.status);
      return;
    }

    const next = fail(
      "Factory refactor is incomplete",
      "The connector still looks partially coupled or the token is not flowing through one factory boundary.",
      [
        "Introduce ConnectorFactory with a single create(SecurityToken) entry point.",
        "Have each service call the factory instead of new DatabaseConnector(...).",
        "Keep the token wiring centralized so future changes stay local.",
      ],
      [
        { label: "Phase", value: "factory design", tone: "warn" },
        { label: "Factory class", value: hasSharedFactory ? "found" : "missing", tone: hasSharedFactory ? "good" : "bad" },
        { label: "Direct connector calls", value: String(directConnectorCount), tone: directConnectorCount === 1 ? "good" : "warn" },
      ],
    );
    setResultTwo(next);
    recordLabResult("lld", lessonId, "factory-nightmare", next.status);
  };

  const runRegistryCheck = () => {
    const hasMapRegistry = has(registryCode, /Map\s*<\s*String\s*,\s*Supplier\s*<\s*Vehicle\s*>>/);
    const hasRegister = has(registryCode, /registerVehicle\s*\(\s*String\s+\w+\s*,\s*Supplier\s*<\s*Vehicle\s*>\s+\w+\s*\)/);
    const hasLookup = has(registryCode, /registry\.get\s*\(\s*type\s*\)/);
    const hasExternalRegister = has(pluginCode, /registerVehicle\s*\(\s*"ElectricBike"\s*,\s*ElectricBike::new\s*\)/);
    const hasPluginLookup = has(pluginCode, /getVehicle\s*\(\s*"ElectricBike"\s*\)/);
    const hasElectricBikeClass = has(pluginCode, /class\s+ElectricBike\s+implements\s+Vehicle/);

    if (hasMapRegistry && hasRegister && hasLookup && hasExternalRegister && hasPluginLookup && hasElectricBikeClass) {
      const next = pass(
        "Dynamic registration works",
        "The factory accepts new vehicle types from outside the original source file and instantiates them through the registry.",
        [
          "VehicleFactory now stores constructors in a registry map.",
          "registerVehicle() adds new runtime types without editing the factory body.",
          "ElectricBike is registered from an external execution block and retrieved through the same API.",
        ],
        [
          { label: "Registry", value: "Map<String, Supplier<Vehicle>>", tone: "good" },
          { label: "External type", value: "ElectricBike", tone: "good" },
          { label: "Factory source edits", value: "none", tone: "good" },
        ],
      );
      setResultThree(next);
      recordLabResult("lld", lessonId, "factory-registry", next.status);
      return;
    }

    const next = fail(
      "The factory is still hardcoded",
      "The registry is not fully dynamic yet, so adding a new vehicle still risks touching the factory source.",
      [
        "Replace switch or if/else with a map-backed registry.",
        "Expose registerVehicle(String, Supplier<Vehicle>) on the factory.",
        "Register ElectricBike from an external block and instantiate it through the same API.",
      ],
      [
        { label: "Registry", value: hasMapRegistry ? "map found" : "missing", tone: hasMapRegistry ? "good" : "bad" },
        { label: "registerVehicle", value: hasRegister ? "found" : "missing", tone: hasRegister ? "good" : "bad" },
        { label: "ElectricBike plugin", value: hasExternalRegister ? "registered" : "not registered", tone: hasExternalRegister ? "good" : "bad" },
      ],
    );
    setResultThree(next);
    recordLabResult("lld", lessonId, "factory-registry", next.status);
  };

  return (
    <section className="my-8 overflow-hidden rounded-sm border border-zinc-800 bg-[#101010] font-mono">
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="text-[11px] uppercase tracking-widest text-amber-500/80">
          Factory Design Pattern
        </div>
        <h3 className="m-0 mt-1 border-0 p-0 text-base font-semibold text-zinc-100">
          Centralize creation, control variation, and keep clients stable
        </h3>
        <p className="m-0 mt-2 max-w-3xl text-xs leading-5 text-zinc-500">
          These labs move from direct instantiation to a factory, then show why a registry-based
          factory scales better when new types keep arriving.
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
                Centralizing Creation Logic
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Replace client-side `new Car()` / `new Truck()` calls with a factory method that
                selects the correct implementation from a shared enum.
              </p>
            </div>
            <button
              type="button"
              onClick={runCentralizationCheck}
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Run Verification
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="border border-zinc-800 bg-[#111111]">
              <div className="border-b border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500">
                Client
              </div>
              <textarea
                value={clientCode}
                onChange={(event) => setClientCode(event.target.value)}
                spellCheck={false}
                className="h-[320px] w-full resize-none bg-transparent p-3 text-xs leading-6 text-zinc-300 outline-none"
              />
            </div>

            <div className="border border-zinc-800 bg-[#111111]">
              <div className="border-b border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500">
                VehicleFactory
              </div>
              <textarea
                value={factoryCode}
                onChange={(event) => setFactoryCode(event.target.value)}
                spellCheck={false}
                className="h-[320px] w-full resize-none bg-transparent p-3 text-xs leading-6 text-zinc-300 outline-none"
              />
            </div>
          </div>

          <div className={`mt-4 border p-3 ${resultOne.status === "pass" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : resultOne.status === "fail" ? "border-red-500/30 bg-red-500/5 text-red-300" : "border-zinc-800 bg-zinc-950 text-zinc-400"}`}>
            <div className="text-sm font-semibold">{resultOne.title}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">{resultOne.detail}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {resultOne.signals.map((signal) => (
                <div key={signal.label} className={`border px-3 py-2 text-xs ${toneClass[signal.tone ?? "neutral"]}`}>
                  <div className="text-zinc-500">{signal.label}</div>
                  <div className="mt-1 text-current">{signal.value}</div>
                </div>
              ))}
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-current opacity-80">
              {resultOne.trace.map((line) => (
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
                The Nightmare Refactor
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Compare three services with direct connector creation against the same services
                routed through one ConnectorFactory that receives the SecurityToken once.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setNightmareMode("raw")}
                className={`border px-3 py-2 text-[11px] uppercase tracking-wider transition-colors ${
                  nightmareMode === "raw"
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Phase A: Bad Design
              </button>
              <button
                type="button"
                onClick={() => setNightmareMode("factory")}
                className={`border px-3 py-2 text-[11px] uppercase tracking-wider transition-colors ${
                  nightmareMode === "factory"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Phase B: Factory Design
              </button>
              <button
                type="button"
                onClick={runNightmareCheck}
                className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
              >
                Validate Phase
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="border border-zinc-800 bg-[#111111]">
              <div className="border-b border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500">
                Services
              </div>
              <textarea
                value={nightmareMode === "raw" ? rawServicesCode : factoryServicesCode}
                onChange={(event) => {
                  if (nightmareMode === "raw") {
                    setRawServicesCode(event.target.value);
                  } else {
                    setFactoryServicesCode(event.target.value);
                  }
                }}
                spellCheck={false}
                className="h-[320px] w-full resize-none bg-transparent p-3 text-xs leading-6 text-zinc-300 outline-none"
              />
            </div>

            <div className="border border-zinc-800 bg-[#111111] p-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">Scenario</div>
              <div className="mt-3 space-y-3 text-xs leading-5 text-zinc-400">
                <p>
                  A deployment rule changed: every `DatabaseConnector` now needs an encrypted
                  `SecurityToken`.
                </p>
                <p>
                  In the raw version, each service must absorb the constructor change separately.
                  In the factory version, you pass the token into `ConnectorFactory` once and keep
                  the services untouched.
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Files opened
                    </div>
                    <div className="mt-1 text-sm text-zinc-100">
                      {nightmareMode === "raw" ? "3" : "1"}
                    </div>
                  </div>
                  <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Token flow
                    </div>
                    <div className="mt-1 text-sm text-zinc-100">
                      {nightmareMode === "raw" ? "repeated" : "centralized"}
                    </div>
                  </div>
                  <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Reset cost
                    </div>
                    <div className="mt-1 text-sm text-zinc-100">
                      {nightmareMode === "raw" ? "high" : "low"}
                    </div>
                  </div>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-300">
                  {nightmareMode === "raw"
                    ? "Goal: prove how much code changes when creation is embedded in every service."
                    : "Goal: prove the factory absorbs the constructor change in one place."}
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 border p-3 ${resultTwo.status === "pass" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : resultTwo.status === "fail" ? "border-red-500/30 bg-red-500/5 text-red-300" : "border-zinc-800 bg-zinc-950 text-zinc-400"}`}>
            <div className="text-sm font-semibold">{resultTwo.title}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">{resultTwo.detail}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {resultTwo.signals.map((signal) => (
                <div key={signal.label} className={`border px-3 py-2 text-xs ${toneClass[signal.tone ?? "neutral"]}`}>
                  <div className="text-zinc-500">{signal.label}</div>
                  <div className="mt-1 text-current">{signal.value}</div>
                </div>
              ))}
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-current opacity-80">
              {resultTwo.trace.map((line) => (
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
                Dynamic Registration
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Replace the hardcoded branch with a registry map, then add `ElectricBike` from an
                external block without editing the factory internals.
              </p>
            </div>
            <button
              type="button"
              onClick={runRegistryCheck}
              className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Check Registry
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="border border-zinc-800 bg-[#111111]">
              <div className="border-b border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500">
                VehicleFactory
              </div>
              <textarea
                value={registryCode}
                onChange={(event) => setRegistryCode(event.target.value)}
                spellCheck={false}
                className="h-[340px] w-full resize-none bg-transparent p-3 text-xs leading-6 text-zinc-300 outline-none"
              />
            </div>

            <div className="border border-zinc-800 bg-[#111111]">
              <div className="border-b border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500">
                External plugin block
              </div>
              <textarea
                value={pluginCode}
                onChange={(event) => setPluginCode(event.target.value)}
                spellCheck={false}
                className="h-[340px] w-full resize-none bg-transparent p-3 text-xs leading-6 text-zinc-300 outline-none"
              />
            </div>
          </div>

          <div className={`mt-4 border p-3 ${resultThree.status === "pass" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : resultThree.status === "fail" ? "border-red-500/30 bg-red-500/5 text-red-300" : "border-zinc-800 bg-zinc-950 text-zinc-400"}`}>
            <div className="text-sm font-semibold">{resultThree.title}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-current opacity-80">{resultThree.detail}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {resultThree.signals.map((signal) => (
                <div key={signal.label} className={`border px-3 py-2 text-xs ${toneClass[signal.tone ?? "neutral"]}`}>
                  <div className="text-zinc-500">{signal.label}</div>
                  <div className="mt-1 text-current">{signal.value}</div>
                </div>
              ))}
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-current opacity-80">
              {resultThree.trace.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </article>
      </div>
    </section>
  );
}
