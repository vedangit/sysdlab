import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="border-b border-zinc-800 bg-[#111111] px-6 md:px-16 py-4 flex items-center justify-between font-mono text-sm sticky top-0 z-50">
      <Link 
        href="/" 
        className="text-zinc-200 hover:text-amber-400 font-bold tracking-tight transition-colors flex items-center gap-2"
      >
        <span className="text-amber-500">~/</span>
        system-design-lab
      </Link>
      
      <div className="flex gap-6 text-zinc-500">
        <Link href="/" className="hover:text-zinc-300 transition-colors">
          Index
        </Link>
        <a 
          href="https://github.com/" 
          target="_blank" 
          rel="noreferrer" 
          className="hover:text-zinc-300 transition-colors"
        >
          Source
        </a>
      </div>
    </nav>
  );
};