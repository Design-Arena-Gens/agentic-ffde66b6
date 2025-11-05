import { PromptBuilder } from "@/components/PromptBuilder";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-12 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,115,246,0.16),_transparent_50%)]" />
      <PromptBuilder />
    </main>
  );
}
