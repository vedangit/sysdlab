import "./globals.css";
import { PgLiteProvider } from "@/components/lab/PgLiteProvider";
import { Navbar } from "@/components/ui/Navbar";
export const metadata = {
  title: "System Design Lab",
  description: "Interactive system design and database internals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a1a] text-gray-200 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <PgLiteProvider>
          {/* Your top navigation will go here later */}
          <Navbar/>
          <main className="min-h-screen">
            {children}
          </main>
        </PgLiteProvider>
      </body>
    </html>
  );
}