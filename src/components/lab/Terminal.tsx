"use client";

import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import { usePgLite } from "@/components/lab/PgLiteProvider";

interface TerminalProps {
  id: string;
  placeholder?: string;
}

export const Terminal = ({ id, placeholder = "Type SQL here..." }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const { db, isReady } = usePgLite();
  
  // Use a mutable ref instead of state to prevent the stale closure bug
  const inputBuffer = useRef("");

  // Refs to prevent stale closures inside the xterm event listeners
  const dbRef = useRef(db);
  const isReadyRef = useRef(isReady);

  // Keep the refs perfectly synced with the Postgres Context
  useEffect(() => {
    dbRef.current = db;
    isReadyRef.current = isReady;
  }, [db, isReady]);

  useEffect(() => {
    let isMounted = true;
    if (!terminalRef.current) return;

    // 1. Initialize core terminal
    const term = new XTerm({
      theme: {
        background: "#111111",
        foreground: "#d1d5db",
        cursor: "#fbbf24",
        selectionBackground: "#374151",
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 14,
      cursorBlink: true,
      disableStdin: false,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    xtermRef.current = term;

    term.writeln(`\x1b[33m==> Terminal ${id} Connected\x1b[0m`);
    term.write("\r\n$ ");

    // 2. The Bulletproof Resize Handler
    const resizeObserver = new ResizeObserver(() => {
      if (!isMounted) return;
      
      requestAnimationFrame(() => {
        if (!isMounted) return;
        try {
          fitAddon.fit();
        } catch (e) {
          // Swallow any mid-render dimension panics harmlessly
        }
      });
    });

    resizeObserver.observe(terminalRef.current);

    // 3. I/O Handling (Using the Mutable Ref)
    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (code === 13) { // Enter key
        term.write("\r\n");
        executeSQL(inputBuffer.current); // Pass the current ref string
        inputBuffer.current = ""; // Reset the ref
      } else if (code === 127) { // Backspace
        if (inputBuffer.current.length > 0) {
          term.write("\b \b");
          inputBuffer.current = inputBuffer.current.slice(0, -1);
        }
      } else { // Standard typing
        term.write(data);
        inputBuffer.current += data;
      }
    });

    // 4. Clean Destruction
    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run absolutely once

  const executeSQL = async (query: string) => {
    // Check the live refs, not the stale closure state
    if (!dbRef.current || !isReadyRef.current) {
      xtermRef.current?.writeln("\x1b[31mError: Database engine not ready or crashed.\x1b[0m");
      xtermRef.current?.write("\r\n$ ");
      return;
    }

    if (!query.trim()) {
      xtermRef.current?.write("$ ");
      return;
    }

    try {
      // Send execution to the WASM Postgres instance
      const result = await dbRef.current.query(query);
      
      if (result.rows.length === 0) {
        xtermRef.current?.writeln("\x1b[32mQuery OK, 0 rows affected.\x1b[0m");
      } else {
        const output = JSON.stringify(result.rows, null, 2);
        const lines = output.split('\n');
        lines.forEach(line => xtermRef.current?.writeln(line));
      }
    } catch (error: any) {
      xtermRef.current?.writeln(`\x1b[31m${error.message}\x1b[0m`);
    }
    
    xtermRef.current?.write("\r\n$ ");
  };

  return (
    <div className="w-full h-full flex flex-col border border-zinc-800 bg-[#111111] rounded-sm overflow-hidden">
      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1 text-xs text-zinc-500 font-mono uppercase tracking-wider flex justify-between">
        <span>Terminal {id}</span>
        <span className="text-amber-500/50">PostgreSQL (WASM)</span>
      </div>
      <div ref={terminalRef} className="flex-grow p-2 overflow-hidden" style={{ minHeight: "250px" }} />
    </div>
  );
};