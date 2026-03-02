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
    if (!isReady) {
      setLogs(["> \x1b[31mError: Multi-Node cluster is still provisioning...\x1b[0m"]);
      return;
    }

    setIsRunning(true);
    const currentLogs: string[] = [];
    
    // A secure logging interceptor to pipe output to our UI instead of the browser console
    const log = (msg: string) => {
      currentLogs.push(msg);
      setLogs([...currentLogs]); 
    };

    try {
      // The Architecture Flex: We are building a dynamic async execution context.
      // We inject the WASM 'nodes' and our custom 'log' function directly into their code's scope.
      const executable = new Function(
        'nodes', 
        'log', 
        `return (async () => {
          try {
            // 1. Evaluate the user's routing logic
            ${code}
            
            // 2. Execute the hidden test suite
            log("\\n> --- Executing Incoming Requests ---");
            ${testScript}
            
          } catch (err) {
            log("> ❌ Runtime Error: " + err.message);
          }
        })();`
      );

      await executable(nodes, log);
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
          disabled={isRunning || !isReady}
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-3 py-1 rounded-sm transition-colors disabled:opacity-50"
        >
          {isRunning ? "Executing..." : "Deploy API Router"}
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