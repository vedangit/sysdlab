import { MultiNodeProvider } from "@/components/lab/MultiNodeProvider";

export default function ScalingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MultiNodeProvider>
      <article className="prose">
        {children}
      </article>
    </MultiNodeProvider>
  );
}