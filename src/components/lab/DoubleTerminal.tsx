"use client";

import React from "react";
import dynamic from "next/dynamic";

// 1. Wrap the Terminal import in Next.js's dynamic loader
// 2. Explicitly tell Next.js to completely skip SSR for this component
const Terminal = dynamic(
  () => import("./Terminal").then((mod) => mod.Terminal),
  { 
    ssr: false,
    // A slick loading state that maintains your "Operator" aesthetic 
    // while the WASM and xterm binaries boot up in the browser
    loading: () => (
      <div className="h-full w-full bg-[#111111] border border-zinc-800 rounded-sm flex flex-col items-center justify-center">
        <span className="text-amber-500/50 text-xs font-mono animate-pulse">
          [ Booting Execution Engine... ]
        </span>
      </div>
    )
  }
);

interface DoubleTerminalProps {
  title?: string;
}

export const DoubleTerminal = ({ title = "Isolation Level Sandbox" }: DoubleTerminalProps) => {
  return (
    <div className="my-8 w-full">
      <div className="mb-2 text-sm font-mono text-zinc-400">
        // {title}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
        <Terminal id="A" />
        <Terminal id="B" />
      </div>
    </div>
  );
};