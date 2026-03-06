"use client";

import React, { useState } from "react";
import { useMultiNode } from "@/components/lab/MultiNodeProvider";

interface ApiRouterSandboxProps {
  title: string;
  defaultCode: string;
  testScript: string;
}

export const ApiRouterSandbox = ({ title, defaultCode, testScript }: ApiRouterSandboxProps) => {
  const { nodes, isReady } = useMultiNode();
  const [code, setCode] = useState(defaultCode);
  const [logs, setLogs] = useState<string[]>(["> System ready. Waiting for deployment..."]);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    // We allow running even if nodes aren't ready (isReady check removed) 
    // because this might be a pure JS/File lab that doesn't need the DB.
    
    setIsRunning(true);
    const currentLogs: string[] = [];
    
    // A secure logging interceptor to pipe output to our UI
    const log = (msg: string) => {
      currentLogs.push(msg);
      setLogs([...currentLogs]); 
    };

    // --- SYSTEM SIMULATOR (File I/O & Time) ---
    const fileSystem: Record<string, any> = {};
    
    const sys = {
      // Simulate reading a file with slight latency (10ms)
      readFile: async (path: string) => {
        await new Promise(r => setTimeout(r, 10)); 
        return fileSystem[path];
      },
      // Simulate writing a file with slight latency
      writeFile: async (path: string, content: any) => {
        await new Promise(r => setTimeout(r, 10));
        fileSystem[path] = content;
      },
      // The sleep function for creating race condition windows
      sleep: (ms: number) => new Promise(r => setTimeout(r, ms))
    };
    // ------------------------------------------

    try {
      // The Architecture Flex: We inject 'sys' into the scope now
      const executable = new Function(
        'nodes', 
        'log', 
        'sys', // <--- New injected tool
        `return (async () => {
          try {
            // 1. Evaluate the user's logic
            ${code}
            
            // 2. Execute the hidden test suite
            log("\\n> --- Executing Simulation ---");
            ${testScript}
            
          } catch (err) {
            log("> ❌ Runtime Error: " + err.message);
          }
        })();`
      );

      // Execute with the new system tool passed in
      await executable(nodes, log, sys);
    } catch (err: any) {
      log(`> ❌ Compilation Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full flex flex-col border border-zinc-800 bg-[#111111] rounded-sm overflow-hidden my-6 font-mono">
      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 text-xs text-zinc-500 uppercase tracking-wider flex justify-between items-center">
        <span>{title}</span>
        <button 
          onClick={runCode}
          disabled={isRunning}
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-3 py-1 rounded-sm transition-colors disabled:opacity-50"
        >
          {isRunning ? "Executing..." : "Run Simulation"}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Code Editor Area */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-800 p-0 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-transparent text-zinc-300 p-4 text-sm focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>
        
        {/* Output Console Area */}
        <div className="w-full md:w-1/2 bg-[#0a0a0a] p-4 h-64 overflow-y-auto">
          {logs.map((line, i) => (
            <div 
              key={i} 
              className={`text-sm mb-1 ${
                line.includes('❌') ? 'text-red-400' : 
                line.includes('✅') ? 'text-green-400' : 
                line.includes('⚠️') ? 'text-amber-400' :
                'text-zinc-400'
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};