"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { PGlite } from "@electric-sql/pglite";

interface MultiNodeContextType {
  nodes: Record<string, PGlite | null>;
  isReady: boolean;
}

const MultiNodeContext = createContext<MultiNodeContextType>({
  nodes: {},
  isReady: false,
});

let sharedClusterPromise: Promise<Record<string, PGlite>> | null = null;
let sharedClusterInstances: Record<string, PGlite> | null = null;

async function getSharedCluster() {
  if (sharedClusterInstances) return sharedClusterInstances;

  if (!sharedClusterPromise) {
    sharedClusterPromise = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");

      const instances = {
        master: await PGlite.create(),
        replica: await PGlite.create(),
        shard_a: await PGlite.create(),
        shard_b: await PGlite.create(),
      };

      await instances.master.exec(`CREATE TABLE users (id INT, name VARCHAR(50));`);
      await instances.replica.exec(`CREATE TABLE users (id INT, name VARCHAR(50));`);
      await instances.shard_a.exec(`CREATE TABLE kv_store (key VARCHAR(10), payload TEXT);`);
      await instances.shard_b.exec(`CREATE TABLE kv_store (key VARCHAR(10), payload TEXT);`);

      sharedClusterInstances = instances;
      return instances;
    })();
  }

  return sharedClusterPromise;
}

export const MultiNodeProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes] = useState<Record<string, PGlite | null>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initCluster = async () => {
      try {
        const instances = await getSharedCluster();

        if (isMounted) {
          setNodes(instances);
          setIsReady(true);
          console.log("\x1b[32m[System] Multi-Node WASM Cluster Provisioned\x1b[0m");
        }
      } catch (error) {
        console.error("Failed to provision distributed cluster:", error);
      }
    };

    initCluster();

    return () => {
      isMounted = false;
    };
  }, []); // Boot exactly once

  return (
    <MultiNodeContext.Provider value={{ nodes, isReady }}>
      {children}
    </MultiNodeContext.Provider>
  );
};

export const useMultiNode = () => useContext(MultiNodeContext);
