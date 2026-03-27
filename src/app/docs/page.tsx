import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen pt-16 px-4 sm:px-8 pb-24 relative z-10 flex flex-col items-center">
      
      {/* Mini Nav */}
      <nav className="w-full max-w-3xl mb-12 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-edu-olive hover:opacity-80 transition-opacity">
          eduweave
        </Link>
        <Link href="/" className="text-edu-green-dark font-medium hover:underline">
          ← back to home
        </Link>
      </nav>

      {/* Doc Content */}
      <main className="w-full max-w-3xl bg-white p-10 sm:p-16 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h1 className="text-4xl sm:text-5xl font-bold text-edu-olive mb-6 tracking-tight">Documentation</h1>
        <p className="text-xl text-edu-text mb-12 font-light">
          The technical and conceptual guide to generating dynamic learning modules.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-edu-olive mb-4 border-b border-gray-100 pb-2">1. The Vision</h2>
          <p className="text-edu-text leading-relaxed mb-4">
            EduWeave was built on a simple premise: static text is an inefficient way to learn complex, dynamic systems. Inspired by the visual storytelling of creators like 3Blue1Brown, our platform aims to democratize highly visual, interactive education.
          </p>
          <p className="text-edu-text leading-relaxed">
            By leveraging Large Language Models (LLMs) and generative UI, we transform standard textbook paragraphs into reactive diagrams, timelines, and spaced-repetition flashcards.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-edu-olive mb-4 border-b border-gray-100 pb-2">2. System Architecture</h2>
          <ul className="space-y-4 text-edu-text">
            <li><strong className="text-edu-olive">Frontend:</strong> Next.js (App Router), React, Tailwind CSS v4, Framer Motion.</li>
            <li><strong className="text-edu-olive">Backend & Auth:</strong> Supabase (PostgreSQL) for secure, scalable data storage and user sessions.</li>
            <li><strong className="text-edu-olive">AI Orchestration:</strong> A hybrid approach utilizing Google's Gemini API for complex multimodal reasoning, paired with local open-weights models (via Ollama) for rapid text parsing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-edu-olive mb-4 border-b border-gray-100 pb-2">3. The Generation Pipeline</h2>
          <ol className="list-decimal pl-5 space-y-3 text-edu-text leading-relaxed">
            <li><strong>Ingestion:</strong> The user inputs raw text or a conceptual prompt.</li>
            <li><strong>Structuring:</strong> The AI breaks the concept down into logical "nodes" (e.g., introduction, core mechanism, real-world example).</li>
            <li><strong>Visual Mapping:</strong> For each node, the AI determines the optimal UI component (a graph, a code block, an interactive SVG).</li>
            <li><strong>Output:</strong> The React frontend renders the JSON output into a seamless, scrollable lesson.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}