"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll("article h2, article h3"));
      
      const parsedHeadings = elements.map((el) => {
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "";
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: el.tagName === "H2" ? 2 : 3,
        };
      });

      setHeadings(parsedHeadings);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Smooth scroll handler
  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Smoothly scroll the element into the viewport
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update the URL hash without causing a jarring jump
      window.history.pushState(null, "", `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0 pt-10 pl-6 border-l border-zinc-800/50">
      <div className="sticky top-10">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
          On This Page
        </span>
        <nav className="flex flex-col gap-2.5 text-sm">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => scrollToHeading(e, heading.id)}
              className={`block text-zinc-400 hover:text-zinc-200 transition-colors ${
                heading.level === 3 ? "pl-4 text-xs" : ""
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}