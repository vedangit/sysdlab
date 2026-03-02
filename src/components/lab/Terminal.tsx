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
  
  const inputBuffer = useRef("");

  const dbRef = useRef(db);
  const isReadyRef = useRef(isReady);

  useEffect(() => {
    dbRef.current = db;
    isReadyRef.current = isReady;
  }, [db, isReady]);

  useEffect(() => {
    let isMounted = true;
    if (!terminalRef.current) return;

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
    xtermRef.current = term;

    // --- THE BOOTLOADER LOCK ---
    // Instead of immediately opening, we wait until the DOM physically exists.
    const bootTerminal = () => {
      if (!isMounted || !terminalRef.current) return;

      // If the browser hasn't painted the width yet, loop and wait.
      if (terminalRef.current.offsetWidth === 0) {
        requestAnimationFrame(bootTerminal);
        return;
      }

      // Safe to boot. The div has physical pixels.
      try {
        term.open(terminalRef.current);
        fitAddon.fit();
        term.writeln(`\x1b[33m==> Terminal ${id} Connected\x1b[0m`);
        term.write("\r\n$ ");
      } catch (error) {
        // Harmlessly swallow any internal xterm layout panics
      }
    };

    // Kick off the boot sequence
    requestAnimationFrame(bootTerminal);

    // --- THE RESIZE SAFETY VALVE ---
    const resizeObserver = new ResizeObserver((entries) => {
      if (!isMounted) return;
      
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return; 
      
      requestAnimationFrame(() => {
        if (!isMounted) return;
        try {
          fitAddon.fit();
        } catch (e) {}
      });
    });

    resizeObserver.observe(terminalRef.current);

    // --- I/O HANDLING ---
    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (code === 13) { 
        term.write("\r\n");
        executeSQL(inputBuffer.current);
        inputBuffer.current = "";
      } else if (code === 127) { 
        if (inputBuffer.current.length > 0) {
          term.write("\b \b");
          inputBuffer.current = inputBuffer.current.slice(0, -1);
        }
      } else { 
        term.write(data);
        inputBuffer.current += data;
      }
    });

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const executeSQL = async (query: string) => {
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