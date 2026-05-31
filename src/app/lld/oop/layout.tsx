import { OopSidebar } from "@/components/ui/OopSidebar";
import { TableOfContents } from "@/components/ui/TableOfContents";

export default function OopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[90rem] mx-auto w-full flex justify-between items-start gap-8 px-4 sm:px-6 lg:px-8">
      <OopSidebar />
      <article className="prose flex-1 min-w-0 py-10 max-w-3xl mx-auto">
        {children}
      </article>
      <TableOfContents />
    </div>
  );
}
