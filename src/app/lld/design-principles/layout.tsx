import { CourseSidebar } from "@/components/ui/CourseSidebar";
import { LessonAccessGate } from "@/components/ui/LessonAccessGate";
import { TableOfContents } from "@/components/ui/TableOfContents";

export default function DesignPrinciplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[90rem] mx-auto w-full flex justify-between items-start gap-8 px-4 sm:px-6 lg:px-8">
      <CourseSidebar courseId="lld" />
      <article className="prose flex-1 min-w-0 py-10 max-w-3xl mx-auto">
        <LessonAccessGate courseId="lld">{children}</LessonAccessGate>
      </article>
      <TableOfContents />
    </div>
  );
}
