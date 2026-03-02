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

export const MultiNodeProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes] = useState<Record<string, PGlite | null>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let instances: Record<string, PGlite> = {};

    const initCluster = async () => {
      try {
        const { PGlite } = await import("@electric-sql/pglite");
        
        // 1. Provision the 4-node cluster in memory
        instances = {
          master: await PGlite.create(),
          replica: await PGlite.create(),
          shard_a: await PGlite.create(),
          shard_b: await PGlite.create(),
        };

        // 2. Pre-seed the Master/Replica with identical schemas so the lab is ready
        await instances.master.exec(`CREATE TABLE users (id INT, name VARCHAR(50));`);
        await instances.replica.exec(`CREATE TABLE users (id INT, name VARCHAR(50));`);
        
        // 3. Pre-seed the Shards with key-value schemas
        await instances.shard_a.exec(`CREATE TABLE kv_store (key VARCHAR(10), payload TEXT);`);
        await instances.shard_b.exec(`CREATE TABLE kv_store (key VARCHAR(10), payload TEXT);`);

        if (isMounted) {
          setNodes(instances);
          setIsReady(true);
          console.log("\x1b[32m[System] Multi-Node WASM Cluster Provisioned\x1b[0m");
        } else {
          // Strict Mode Kill Switch: Destroy the cluster if React aborts the mount
          Object.values(instances).forEach(db => db.close());
        }
      } catch (error) {
        console.error("Failed to provision distributed cluster:", error);
      }
    };

    initCluster();

    return () => {
      isMounted = false;
      Object.values(instances).forEach(db => db.close());
    };
  }, []); // Boot exactly once

  return (
    <MultiNodeContext.Provider value={{ nodes, isReady }}>
      {children}
    </MultiNodeContext.Provider>
  );
};

export const useMultiNode = () => useContext(MultiNodeContext);