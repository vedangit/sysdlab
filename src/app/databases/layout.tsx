import { Sidebar } from "@/components/ui/Sidebar";
import { TableOfContents } from "@/components/ui/TableOfContents";

export default function DatabasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We use a wide 90rem max-width here so the 3 columns have room to breathe
    <div className="max-w-[90rem] mx-auto w-full flex justify-between items-start gap-8 px-4 sm:px-6 lg:px-8">
      
      {/* Left Column: Module Navigation */}
      <Sidebar />

      {/* Center Column: The MDX Prose */}
      <article className="flex-1 min-w-0 py-10 max-w-3xl mx-auto">
        {children}
      </article>

      {/* Right Column: Page Outline */}
      <TableOfContents />
      
    </div>
  );
}