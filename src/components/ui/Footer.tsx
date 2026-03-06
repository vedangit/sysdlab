import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-[#0a0a0a] mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-zinc-200 font-mono font-bold tracking-tight text-sm">
            SYSTEM_DESIGN_LAB
          </span>
          <p className="text-zinc-600 text-xs font-mono">
            Engineered for depth. © {new Date().getFullYear()}
          </p>
        </div>

        {/* Thematic Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-zinc-900/50 border border-zinc-800/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            Cluster Operational
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link 
            href="https://github.com" 
            target="_blank"
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-xs font-mono uppercase tracking-wide"
          >
            GitHub
          </Link>
          <Link 
            href="https://twitter.com" 
            target="_blank"
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-xs font-mono uppercase tracking-wide"
          >
            Twitter
          </Link>
          <Link 
            href="/about" 
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-xs font-mono uppercase tracking-wide"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}