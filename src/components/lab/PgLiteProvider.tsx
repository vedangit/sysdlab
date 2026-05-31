"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { PGlite } from "@electric-sql/pglite";

interface PgLiteContextType {
  db: PGlite | null;
  isReady: boolean;
}

const PgLiteContext = createContext<PgLiteContextType>({
  db: null,
  isReady: false,
});

let sharedDbPromise: Promise<PGlite> | null = null;
let sharedDbInstance: PGlite | null = null;

async function getSharedDb() {
  if (sharedDbInstance) return sharedDbInstance;

  if (!sharedDbPromise) {
    sharedDbPromise = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const instance = await PGlite.create();
      sharedDbInstance = instance;
      return instance;
    })();
  }

  return sharedDbPromise;
}

export const PgLiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<PGlite | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initDb = async () => {
      try {
        const pgInstance = await getSharedDb();

        if (isMounted) {
          setDb(pgInstance);
          setIsReady(true);
          console.log("\x1b[32mPostgres WASM Engine Initialized Successfully\x1b[0m");
        }
      } catch (error) {
        console.error("Failed to initialize PGlite:", error);
      }
    };

    initDb();

    return () => {
      isMounted = false;
    };
  }, []); // <-- Empty array. This engine boots exactly once.

  return (
    <PgLiteContext.Provider value={{ db, isReady }}>
      {children}
    </PgLiteContext.Provider>
  );
};

export const usePgLite = () => useContext(PgLiteContext);
