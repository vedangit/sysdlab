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

export const PgLiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<PGlite | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let pgInstance: PGlite | null = null;

    const initDb = async () => {
      try {
        const { PGlite } = await import("@electric-sql/pglite");
        pgInstance = await PGlite.create();

        if (isMounted) {
          setDb(pgInstance);
          setIsReady(true);
          console.log("\x1b[32mPostgres WASM Engine Initialized Successfully\x1b[0m");
        } else {
          // Strict Mode catch: if React unmounted us while the binary was downloading, 
          // cleanly close the orphaned instance so it doesn't memory leak.
          pgInstance.close();
        }
      } catch (error) {
        console.error("Failed to initialize PGlite:", error);
      }
    };

    initDb();

    return () => {
      isMounted = false;
      if (pgInstance) {
        pgInstance.close();
      }
    };
  }, []); // <-- Empty array. This engine boots exactly once.

  return (
    <PgLiteContext.Provider value={{ db, isReady }}>
      {children}
    </PgLiteContext.Provider>
  );
};

export const usePgLite = () => useContext(PgLiteContext);