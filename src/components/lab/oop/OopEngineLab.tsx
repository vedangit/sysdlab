"use client";

import React, { useMemo, useState } from "react";
import { useCourseProgress } from "@/components/providers/CourseProgressProvider";

type MemoryRow = {
  address: string;
  label: string;
  value: string;
  tone?: "neutral" | "good" | "bad" | "warn";
};

type LabResult = {
  status: "idle" | "pass" | "fail";
  title: string;
  detail: string;
  trace: string[];
  memory: MemoryRow[];
};

type LabConfig = {
  title: string;
  subtitle: string;
  goal: string;
  defaultCode: string;
  idleMemory: MemoryRow[];
  run: (code: string) => LabResult;
};

type LabId =
  | "identity"
  | "shared-state"
  | "shallow-copy"
  | "singleton"
  | "vtable"
  | "relationships"
  | "encapsulation"
  | "interface-collision"
  | "variance"
  | "generic-cache";

const pass = (
  title: string,
  detail: string,
  trace: string[],
  memory: MemoryRow[],
): LabResult => ({ status: "pass", title, detail, trace, memory });

const fail = (
  title: string,
  detail: string,
  trace: string[],
  memory: MemoryRow[],
): LabResult => ({ status: "fail", title, detail, trace, memory });

const contains = (code: string, pattern: RegExp) => pattern.test(code);

const labs: Record<LabId, LabConfig> = {
  identity: {
    title: "Object Identity Inspector",
    subtitle: "Exercise 1.1: Identity vs. Equality",
    goal: "Keep each object as its own instance and distinguish reference identity from same-value equality.",
    defaultCode: `class UserProfile {
  String name;
  int loginCount;

  UserProfile(String name) {
    this.name = name;
    this.loginCount = 0;
  }
}

UserProfile a = new UserProfile("Ava");
UserProfile b = a;
UserProfile c = new UserProfile("Ava");

boolean sameReference = a == b;
boolean sameValue = a.equals(c);`,
    idleMemory: [
      { address: "stack:a", label: "Reference a", value: "UserProfile -> 0x011A" },
      { address: "stack:b", label: "Reference b", value: "alias of a", tone: "warn" },
      { address: "stack:c", label: "Reference c", value: "uninspected" },
    ],
    run: (code) => {
      const usesSeparateObjects = (code.match(/new\s+UserProfile\s*\(/g) || []).length >= 2;
      const avoidsAlias = !contains(code, /UserProfile\s+b\s*=\s*a\s*;/);
      const comparesIdentity = contains(code, /==/);
      const comparesValue = contains(code, /\.equals\s*\(/);

      if (usesSeparateObjects && avoidsAlias && comparesIdentity && comparesValue) {
        return pass(
          "Identity and equality are separated",
          "Each object keeps its own heap address while value comparison stays explicit.",
          [
            "Allocated UserProfile a at 0x011A.",
            "Allocated UserProfile c at 0x01C7 instead of aliasing a.",
            "Reference equality and value equality are now checked as different concepts.",
            "Mutating a no longer silently mutates c through a shared reference.",
          ],
          [
            { address: "stack:a", label: "Reference a", value: "0x011A", tone: "good" },
            { address: "stack:b", label: "Reference b", value: "separate instance", tone: "good" },
            { address: "stack:c", label: "Reference c", value: "0x01C7", tone: "good" },
          ],
        );
      }

      return fail(
        "Object identity is still blurred",
        "The engine still sees one variable aliasing another or the code never distinguishes identity from value.",
        [
          "b still points at the same object as a.",
          "Same-value objects are not the same heap address.",
          "Use a separate allocation and compare identity and equality intentionally.",
        ],
        [
          { address: "stack:a", label: "Reference a", value: "0x011A", tone: "bad" },
          { address: "stack:b", label: "Reference b", value: "alias of a", tone: "bad" },
          { address: "stack:c", label: "Reference c", value: "needs separate allocation", tone: "bad" },
        ],
      );
    },
  },
  "shared-state": {
    title: "Instance State Boundary",
    subtitle: "Exercise 1.2: State Lives With the Object",
    goal: "Move mutable data off the class itself so every instance owns its own state.",
    defaultCode: `class SessionCart {
  static int itemCount = 0;
  String owner;

  SessionCart(String owner) {
    this.owner = owner;
  }

  void addItem() {
    itemCount++;
  }
}

SessionCart alice = new SessionCart("Alice");
SessionCart bob = new SessionCart("Bob");
alice.addItem();
bob.addItem();`,
    idleMemory: [
      { address: "class", label: "Mutable field", value: "static itemCount", tone: "warn" },
      { address: "alice", label: "Alice cart", value: "shared counter" },
      { address: "bob", label: "Bob cart", value: "shared counter" },
    ],
    run: (code) => {
      const hasStaticCounter = contains(code, /static\s+int\s+itemCount/);
      const ownsCounter = contains(code, /(private|protected|public)?\s*int\s+itemCount\s*;/) && !hasStaticCounter;
      const usesInstanceAdd = contains(code, /itemCount\s*\+\+/);
      const createsTwoCarts = (code.match(/new\s+SessionCart\s*\(/g) || []).length >= 2;

      if (!hasStaticCounter && ownsCounter && usesInstanceAdd && createsTwoCarts) {
        return pass(
          "State now belongs to each object",
          "Each cart keeps its own counter, so Alice and Bob can mutate independently.",
          [
            "Removed class-level shared counter.",
            "Allocated one counter per SessionCart instance.",
            "alice.addItem() no longer leaks into bob's state.",
            "The object boundary now matches the business boundary.",
          ],
          [
            { address: "alice", label: "Alice cart", value: "itemCount=1", tone: "good" },
            { address: "bob", label: "Bob cart", value: "itemCount=1", tone: "good" },
            { address: "class", label: "Shared state", value: "removed", tone: "good" },
          ],
        );
      }

      return fail(
        "Mutable state is still shared",
        "The class still owns the counter, so every instance mutates the same memory slot.",
        [
          "A static mutable field makes every object share one counter.",
          "One user's action will change another user's view of the world.",
          "Move the counter into the instance and keep class-level data immutable.",
        ],
        [
          { address: "class", label: "Mutable field", value: hasStaticCounter ? "static itemCount" : "needs instance field", tone: "bad" },
          { address: "alice", label: "Alice cart", value: "shared counter", tone: "bad" },
          { address: "bob", label: "Bob cart", value: "shared counter", tone: "bad" },
        ],
      );
    },
  },
  "shallow-copy": {
    title: "Memory Layout & Reference Inspector",
    subtitle: "Exercise 2.1: Copy Constructor Basics",
    goal: "Replace aliasing with a copy constructor so the new object gets its own identity.",
    defaultCode: `class Movie {
  String title;

  Movie(String title) {
    this.title = title;
  }

  Movie(Movie other) {
    this.title = other.title;
  }
}

Movie originalMovie = new Movie("Heat");
Movie copyMovie = originalMovie;
copyMovie.title = "Copy";`,
    idleMemory: [
      { address: "0x004FFA0", label: "originalMovie", value: "Movie -> 0x004FFA0" },
      { address: "0x004FFA0+8", label: "title_ptr", value: "\"Heat\"", tone: "warn" },
      { address: "0x004FFC0", label: "copyMovie", value: "uninspected" },
    ],
    run: (code) => {
      const hasCopyConstructor = contains(code, /Movie\s*\(\s*Movie\s+\w+\s*\)/);
      const separateAllocation = (code.match(/new\s+Movie\s*\(/g) || []).length >= 2;
      const stillAliases = contains(code, /copyMovie\s*=\s*originalMovie\s*;/);

      if (hasCopyConstructor && separateAllocation && !stillAliases) {
        return pass(
          "Copy constructor creates a separate object",
          "The copied Movie receives its own heap address instead of sharing the original reference.",
          [
            "Allocated originalMovie at 0x004FFA0.",
            "Allocated copyMovie at 0x004FFC0.",
            "Title copied through the constructor instead of through aliasing.",
            "Mutation routed to copyMovie only; originalMovie remains stable.",
          ],
          [
            { address: "0x004FFA0", label: "originalMovie.title", value: "\"Heat\"", tone: "good" },
            { address: "0x004FFC0", label: "copyMovie.title", value: "\"Copy\"", tone: "good" },
            { address: "0x004FFC0+8", label: "copyMovie.source", value: "Movie(Movie other)", tone: "good" },
          ],
        );
      }

      return fail(
        "Shared reference mutation detected",
        "The engine still sees originalMovie and copyMovie pointing at the same object.",
        [
          "copyMovie resolves to the same Movie address as originalMovie.",
          "Add Movie(Movie other) and allocate a new Movie from it.",
          "Copy the field values, not the reference itself.",
        ],
        [
          { address: "0x004FFA0", label: "originalMovie", value: "Movie", tone: "bad" },
          { address: "0x004FFA0", label: "copyMovie", value: "alias of originalMovie", tone: "bad" },
        ],
      );
    },
  },
  singleton: {
    title: "Concurrent Allocation Guard",
    subtitle: "Exercise 2.2: Singleton Basics",
    goal: "Hide raw construction and make every call return the same shared instance.",
    defaultCode: `class ConfigRegistry {
  private static ConfigRegistry instance;

  private ConfigRegistry() {
  }

  public static ConfigRegistry getInstance() {
    if (instance == null) {
      instance = new ConfigRegistry();
    }
    return instance;
  }
}`,
    idleMemory: [
      { address: "T1", label: "Thread 1", value: "instance == null" },
      { address: "T2", label: "Thread 2", value: "instance == null" },
      { address: "heap", label: "Allocations", value: "unlocked" },
    ],
    run: (code) => {
      const privateCtor = contains(code, /private\s+ConfigRegistry\s*\(/);
      const staticInstance = contains(code, /private\s+static\s+ConfigRegistry\s+instance/);
      const hasGetInstance = contains(code, /public\s+static\s+ConfigRegistry\s+getInstance\s*\(/);
      const returnsInstance = contains(code, /return\s+instance\s*;/);

      if (privateCtor && staticInstance && hasGetInstance && returnsInstance) {
        return pass(
          "Singleton access is centralized",
          "The class can only be created from inside itself, and every caller receives the same instance.",
          [
            "Constructor visibility changed to private.",
            "getInstance() allocates once and reuses the same reference.",
            "External code can no longer call new ConfigRegistry().",
          ],
          [
            { address: "0x00A11CE", label: "ConfigRegistry.instance", value: "shared singleton", tone: "good" },
            { address: "call", label: "getInstance()", value: "returns shared reference", tone: "good" },
          ],
        );
      }

      return fail(
        "Construction is still exposed",
        "The engine still sees a public constructor or an incomplete getInstance flow.",
        [
          "Hide the constructor behind private visibility.",
          "Keep a static instance field.",
          "Return the same instance from getInstance().",
        ],
        [
          { address: "ctor", label: "Raw new ConfigRegistry()", value: "allowed", tone: "bad" },
          { address: "instance", label: "Static instance", value: "missing or incomplete", tone: "bad" },
        ],
      );
    },
  },
  vtable: {
    title: "Vtable Routing Simulator",
    subtitle: "Exercise 2.1: Virtual Method Table Tracker",
    goal: "Use a base reference that points at a child object and inspect runtime dispatch.",
    defaultCode: `class Vehicle {
  void start() {
    log("Vehicle ignition");
  }
}

class Car extends Vehicle {
  @Override
  void start() {
    log("Car engine started");
  }
}

Vehicle v = new Car();
v.start();`,
    idleMemory: [
      { address: "stack:v", label: "Static reference", value: "Vehicle" },
      { address: "heap:0x0440", label: "Runtime object", value: "Car" },
      { address: "vtable[0]", label: "start()", value: "pending" },
    ],
    run: (code) => {
      const baseRef = contains(code, /Vehicle\s+\w+\s*=\s*new\s+Car\s*\(\s*\)/);
      const override = contains(code, /@Override[\s\S]*void\s+start\s*\(/);
      const invokesStart = contains(code, /\w+\.start\s*\(\s*\)/);

      if (baseRef && override && invokesStart) {
        return pass(
          "Runtime dispatch routes to Car::start",
          "The compiler stores a Vehicle-shaped reference, but the object header points at Car's vtable.",
          [
            "Compile-time type check accepts Vehicle.start().",
            "Runtime loads object header from heap address 0x0440.",
            "Header vptr resolves to Car.vtable.",
            "Slot 0 dispatches to Car::start().",
          ],
          [
            { address: "stack:v", label: "Static type", value: "Vehicle", tone: "warn" },
            { address: "0x0440.header", label: "Runtime type", value: "Car", tone: "good" },
            { address: "Car.vtable[0]", label: "start()", value: "Car::start", tone: "good" },
          ],
        );
      }

      return fail(
        "Dispatch path is not polymorphic yet",
        "The engine needs a parent reference, child allocation, override, and call site to trace vtable routing.",
        [
          "Declare Vehicle v = new Car().",
          "Override start() in Car.",
          "Call v.start() through the parent-typed reference.",
        ],
        [
          { address: "stack:v", label: "Static reference", value: "missing Vehicle -> Car binding", tone: "bad" },
          { address: "vtable[0]", label: "start()", value: "unresolved", tone: "bad" },
        ],
      );
    },
  },
  relationships: {
    title: "Structural Relationship Modeler",
    subtitle: "Exercise 2.2: Dependency vs. Association",
    goal: "Model short-lived method use as dependency and retained field ownership as association.",
    defaultCode: `class Printer {
}

class Document {
  void print(Printer p) {
    p.print(this);
  }
}

class Author {
}

class Book {
  private Author author;
}`,
    idleMemory: [
      { address: "Document.print", label: "Printer parameter", value: "candidate dependency" },
      { address: "Book.author", label: "Author field", value: "candidate association" },
    ],
    run: (code) => {
      const dependency = contains(code, /print\s*\(\s*Printer\s+\w+\s*\)/);
      const association = contains(code, /private\s+Author\s+\w+\s*;/);

      if (dependency && association) {
        return pass(
          "UML links classified correctly",
          "Printer is scoped to the print call, while Author is retained as object state on Book.",
          [
            "Document -> Printer uses a dashed dependency line.",
            "Book -> Author uses a solid association arrow.",
            "The engine found no persistent Printer field on Document.",
          ],
          [
            { address: "Document -- -- > Printer", label: "Dependency", value: "method parameter", tone: "good" },
            { address: "Book ----> Author", label: "Association", value: "retained field pointer", tone: "good" },
          ],
        );
      }

      return fail(
        "Relationship graph incomplete",
        "Use a Printer parameter for transient work and an Author field for retained object knowledge.",
        [
          "Document.print(Printer p) creates a scoped dependency.",
          "private Author author; creates a long-lived association.",
        ],
        [
          { address: "Document -> Printer", label: "Dependency", value: dependency ? "found" : "missing", tone: dependency ? "good" : "bad" },
          { address: "Book -> Author", label: "Association", value: association ? "found" : "missing", tone: association ? "good" : "bad" },
        ],
      );
    },
  },
  encapsulation: {
    title: "State Mutation Sandbox",
    subtitle: "Exercise 3.1: Visibility Bounds",
    goal: "Hide account state and force all mutations through validation.",
    defaultCode: `class Account {
  public int balance;

  public void withdraw(int amount) {
    balance = balance - amount;
  }
}

Account acc = new Account();
acc.balance = -50000;`,
    idleMemory: [
      { address: "client", label: "Attack payload", value: "acc.balance = -50000" },
      { address: "Account.balance", label: "Visibility", value: "public", tone: "bad" },
    ],
    run: (code) => {
      const privateBalance = contains(code, /private\s+int\s+balance/);
      const validatesNegative = contains(code, /amount\s*<=\s*0|amount\s*<\s*0|balance\s*-\s*amount\s*<\s*0|throw\s+new/);
      const directAttackRemoved = !contains(code, /acc\.balance\s*=/);

      if (privateBalance && validatesNegative && directAttackRemoved) {
        return pass(
          "Mutation boundary sealed",
          "Direct field writes are rejected and invalid withdrawals are intercepted before state changes.",
          [
            "Client code cannot compile acc.balance = -50000.",
            "withdraw(amount) is the only mutation entry point.",
            "Validator rejects negative or impossible withdrawal amounts.",
          ],
          [
            { address: "Account.balance", label: "Visibility", value: "private", tone: "good" },
            { address: "withdraw(-50000)", label: "Validator", value: "rejected", tone: "good" },
            { address: "heap:balance", label: "State", value: "unchanged", tone: "good" },
          ],
        );
      }

      return fail(
        "State corruption path remains",
        "The client can still bypass invariants or the mutator does not validate hostile inputs.",
        [
          "Make balance private.",
          "Remove direct acc.balance assignment from client code.",
          "Reject negative amounts and overdrafts in the method boundary.",
        ],
        [
          { address: "Account.balance", label: "Visibility", value: privateBalance ? "private" : "public/writeable", tone: privateBalance ? "good" : "bad" },
          { address: "withdraw()", label: "Validation", value: validatesNegative ? "present" : "missing", tone: validatesNegative ? "good" : "bad" },
        ],
      );
    },
  },
  "interface-collision": {
    title: "Default Method Collision Resolver",
    subtitle: "Exercise 3.2: Interface Diamond Collision",
    goal: "Override the duplicate default method and explicitly choose or merge parent behavior.",
    defaultCode: `interface InterfaceA {
  default void debugLog() {
    log("A");
  }
}

interface InterfaceB {
  default void debugLog() {
    log("B");
  }
}

class Service implements InterfaceA, InterfaceB {
}`,
    idleMemory: [
      { address: "InterfaceA.default", label: "debugLog()", value: "A route" },
      { address: "InterfaceB.default", label: "debugLog()", value: "B route" },
      { address: "Service", label: "Dispatch", value: "ambiguous", tone: "bad" },
    ],
    run: (code) => {
      const serviceImplementsBoth = contains(code, /implements\s+InterfaceA\s*,\s*InterfaceB/);
      const override = contains(code, /class\s+Service[\s\S]*@Override[\s\S]*void\s+debugLog\s*\(/);
      const explicitParent = contains(code, /Interface(A|B)\.super\.debugLog\s*\(\s*\)/);

      if (serviceImplementsBoth && override && explicitParent) {
        return pass(
          "Default method collision resolved",
          "Service now owns the dispatch slot and explicitly chooses a parent route.",
          [
            "Compiler detects two inherited debugLog defaults.",
            "Service overrides debugLog().",
            "Override calls InterfaceA.super or InterfaceB.super explicitly.",
            "Ambiguous diamond path is collapsed into one concrete method.",
          ],
          [
            { address: "Service.vtable[debugLog]", label: "Owner", value: "Service::debugLog", tone: "good" },
            { address: "parent route", label: "Explicit call", value: "Interface.super.debugLog()", tone: "good" },
          ],
        );
      }

      return fail(
        "Compiler ambiguity remains",
        "A class implementing both interfaces must override the duplicate default signature.",
        [
          "Add @Override void debugLog() inside Service.",
          "Call InterfaceA.super.debugLog() or InterfaceB.super.debugLog() if you want parent behavior.",
        ],
        [
          { address: "InterfaceA.debugLog", label: "Candidate", value: "default", tone: "warn" },
          { address: "InterfaceB.debugLog", label: "Candidate", value: "default", tone: "warn" },
          { address: "Service.debugLog", label: "Concrete owner", value: override ? "override found" : "missing", tone: override ? "good" : "bad" },
        ],
      );
    },
  },
  variance: {
    title: "Generic Variance Bounds Inspector",
    subtitle: "Exercise 4.1: The Invariant Read/Write Trap",
    goal: "Move write operations from an upper-bounded producer list to a lower-bounded consumer list.",
    defaultCode: `void collect(List<? extends Number> values) {
  values.add(Integer.valueOf(10));
}`,
    idleMemory: [
      { address: "List<? extends Number>", label: "Runtime candidate", value: "List<Double>" },
      { address: "add(Integer)", label: "Operation", value: "unsafe", tone: "bad" },
    ],
    run: (code) => {
      const lowerBound = contains(code, /List\s*<\s*\?\s+super\s+Integer\s*>/);
      const addInteger = contains(code, /\.add\s*\(\s*(Integer\.valueOf\s*\(\s*10\s*\)|10)\s*\)/);

      if (lowerBound && addInteger) {
        return pass(
          "Write-capable variance selected",
          "The list can safely accept Integer because every permitted runtime list is Integer or an ancestor.",
          [
            "? extends Number is a producer contract: safe reads, unsafe writes.",
            "? super Integer is a consumer contract: safe Integer writes.",
            "The compiler can now prove add(Integer) is valid.",
          ],
          [
            { address: "List<? super Integer>", label: "Allowed runtime", value: "List<Integer>", tone: "good" },
            { address: "List<? super Integer>", label: "Allowed runtime", value: "List<Number>", tone: "good" },
            { address: "add(10)", label: "Write", value: "accepted", tone: "good" },
          ],
        );
      }

      return fail(
        "Upper-bounded write rejected",
        "A List<? extends Number> might be a List<Double>, so inserting Integer would corrupt type safety.",
        [
          "Keep ? extends Number for reading Number values.",
          "Use ? super Integer when this method must insert Integer values.",
        ],
        [
          { address: "runtime", label: "Possible list", value: "List<Double>", tone: "warn" },
          { address: "add(Integer)", label: "Compiler verdict", value: "rejected", tone: "bad" },
        ],
      );
    },
  },
  "generic-cache": {
    title: "Universal Type Storage Engine",
    subtitle: "Exercise 4.2: Generic Cache",
    goal: "Replace raw Object storage with Cache<K, V> so reads recover typed values without casts.",
    defaultCode: `class Cache {
  private Map<Object, Object> store = new HashMap<>();

  Object get(Object key) {
    return store.get(key);
  }

  void put(Object key, Object value) {
    store.put(key, value);
  }
}

String name = (String) cache.get("user:1");`,
    idleMemory: [
      { address: "Map<Object,Object>", label: "Key/value slots", value: "raw references", tone: "warn" },
      { address: "read", label: "Retrieval", value: "manual cast required", tone: "bad" },
    ],
    run: (code) => {
      const genericClass = contains(code, /class\s+Cache\s*<\s*K\s*,\s*V\s*>/);
      const typedMap = contains(code, /Map\s*<\s*K\s*,\s*V\s*>/);
      const typedGet = contains(code, /V\s+get\s*\(\s*K\s+\w+\s*\)/);
      const typedPut = contains(code, /void\s+put\s*\(\s*K\s+\w+\s*,\s*V\s+\w+\s*\)/);
      const noExplicitCast = !contains(code, /\(\s*String\s*\)\s*cache\.get/);

      if (genericClass && typedMap && typedGet && typedPut && noExplicitCast) {
        return pass(
          "Cache type contract is compile-time safe",
          "Keys and values are parameterized, so the compiler preserves read types at the call site.",
          [
            "Cache<K, V> carries type parameters through put and get.",
            "Map<K, V> prevents cross-type key/value pollution.",
            "get(K key) returns V directly.",
            "No explicit cast is needed at retrieval.",
          ],
          [
            { address: "Cache<String, User>", label: "K", value: "String", tone: "good" },
            { address: "Cache<String, User>", label: "V", value: "User", tone: "good" },
            { address: "get(\"user:1\")", label: "Return type", value: "User", tone: "good" },
          ],
        );
      }

      return fail(
        "Raw object storage still leaks casts",
        "The cache does not yet preserve key/value types through the API boundary.",
        [
          "Declare class Cache<K, V>.",
          "Store values in Map<K, V>.",
          "Return V from get(K key).",
          "Remove explicit casts at call sites.",
        ],
        [
          { address: "Cache<K,V>", label: "Generic class", value: genericClass ? "found" : "missing", tone: genericClass ? "good" : "bad" },
          { address: "get()", label: "Return", value: typedGet ? "typed V" : "raw Object", tone: typedGet ? "good" : "bad" },
        ],
      );
    },
  },
};

type OopEngineLabProps = {
  lab: LabId;
  lessonId: string;
};

const toneClass = {
  neutral: "border-zinc-800 text-zinc-400",
  good: "border-emerald-500/30 text-emerald-300",
  bad: "border-red-500/30 text-red-300",
  warn: "border-amber-500/30 text-amber-300",
};

export function OopEngineLab({ lab, lessonId }: OopEngineLabProps) {
  const config = labs[lab];
  const { recordLabResult } = useCourseProgress();
  const [code, setCode] = useState(config.defaultCode);
  const [result, setResult] = useState<LabResult>({
    status: "idle",
    title: "Engine idle",
    detail: config.goal,
    trace: ["Edit the code, then run the inspector."],
    memory: config.idleMemory,
  });

  const statusClass = useMemo(() => {
    if (result.status === "pass") return "text-emerald-300 border-emerald-500/30 bg-emerald-500/5";
    if (result.status === "fail") return "text-red-300 border-red-500/30 bg-red-500/5";
    return "text-zinc-400 border-zinc-800 bg-zinc-950";
  }, [result.status]);

  return (
    <section className="my-8 overflow-hidden rounded-sm border border-zinc-800 bg-[#101010] font-mono">
      <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-amber-500/80">{config.title}</div>
          <h3 className="m-0 mt-1 border-0 p-0 text-base font-semibold text-zinc-100">{config.subtitle}</h3>
          <p className="m-0 mt-1 text-[11px] leading-5 text-zinc-500">
            Pattern-based checker only — it inspects code shape and state flow, but it does not
            compile Java.
          </p>
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
          Run Engine Check
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
            <div className="mb-2 text-[11px] uppercase tracking-widest text-zinc-500">Pointer Matrix</div>
            <div className="grid gap-2">
              {result.memory.map((row, index) => (
                <div
                  key={`${row.address}-${index}`}
                  className={`grid grid-cols-[120px_1fr] gap-3 border bg-black/20 px-3 py-2 text-xs ${
                    toneClass[row.tone ?? "neutral"]
                  }`}
                >
                  <span>{row.address}</span>
                  <span>
                    <span className="text-zinc-500">{row.label}: </span>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex-1 border-t border-zinc-800 px-4 py-4">
            <div className="mb-2 text-[11px] uppercase tracking-widest text-zinc-500">Execution Trace</div>
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
