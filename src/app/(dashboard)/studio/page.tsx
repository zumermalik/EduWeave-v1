"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// --- The Living Pencil Blueprint Background ---
const InteractiveBackground = () => {
  const nodes = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 40 + 20,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <svg className="absolute w-full h-full opacity-60">
        <defs>
          <filter id="pencil-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        
        {nodes.map((node, i) => {
          const nextNode = nodes[(i + 1) % nodes.length];
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${node.x}%`} y1={`${node.y}%`}
              x2={`${nextNode.x}%`} y2={`${nextNode.y}%`}
              stroke="#4A4737" strokeWidth="1" strokeOpacity="0.1"
              filter="url(#pencil-texture)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.1 }}
            />
          );
        })}

        {nodes.map((node) => (
          <motion.circle
            key={`node-${node.id}`}
            cx={`${node.x}%`} cy={`${node.y}%`} r={node.size / 2}
            fill="transparent" stroke="#4A4737" strokeWidth="1.5" strokeOpacity="0.3"
            filter="url(#pencil-texture)"
            className="pointer-events-auto cursor-crosshair"
            whileHover={{
              scale: 1.5, stroke: "#8BCC3B", strokeWidth: 4, strokeOpacity: 1,
              fill: "rgba(139, 204, 59, 0.1)", filter: "none",
            }}
            animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
            transition={{
              y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default function StudioPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // --- BYOK State ---
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Load the API key from local storage when the component mounts
  useEffect(() => {
    const savedKey = localStorage.getItem("eduweave_gemini_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem("eduweave_gemini_key", newKey);
  };

  const loadingSteps = [
    "Parsing text and context...",
    "Orchestrating AI agents...",
    "Drafting multimodal diagrams...",
    "Saving to your library..."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setActiveStep(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to weave a module.");

      setActiveStep(1);

      // --- PASS THE API KEY TO THE BACKEND ---
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate lesson content.");
      }

      setActiveStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));

      setActiveStep(3);

      const { data: insertedLesson, error: dbError } = await supabase
        .from("lessons")
        .insert({
          user_id: user.id,
          title: data.data.title,
          description: data.data.description,
          content: data.data.sections,
          progress: 0,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      router.push(`/lesson/${insertedLesson.id}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 px-4 sm:px-8 pb-24 relative flex flex-col">
      <InteractiveBackground />

      {/* Top Nav - High z-index to stay above background */}
      <nav className="w-full flex justify-between items-center mb-8 relative z-20 max-w-5xl mx-auto">
        
        {/* Left: Return to Home */}
        <Link href="/" className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl text-edu-text hover:text-edu-olive hover:bg-white transition-all font-medium flex items-center gap-2 shadow-sm border border-gray-100">
          <span>←</span> return to home
        </Link>

        {/* Right: Go to Library (Action Button) */}
        <Link href="/library" className="bg-edu-green-dark text-white px-6 py-2 rounded-xl font-medium hover:bg-edu-olive transition-transform hover:-translate-y-0.5 shadow-sm shadow-edu-green-dark/20 flex items-center gap-2">
          go to library <span>→</span>
        </Link>
        
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto relative z-20">
        <AnimatePresence mode="wait">
          {!isGenerating ? (
            <motion.div 
              key="input-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-edu-olive mb-4 tracking-tight drop-shadow-sm">
                  what are we learning today?
                </h1>
                <p className="text-edu-olive/80 text-lg bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-white/40">
                  Paste a textbook chapter, an article, or a complex question.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-center font-medium shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleGenerate} className="w-full bg-white/90 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white flex flex-col transition-all">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Paste up to 10,000 words here..."
                  className="w-full h-48 sm:h-64 p-6 bg-transparent resize-none outline-none text-edu-olive text-lg placeholder:text-gray-400"
                  autoFocus
                />
                
                {/* --- SETTINGS DRAWER --- */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50/50 border-t border-gray-100 px-6 py-4"
                    >
                      <label className="block text-xs font-bold text-edu-olive uppercase tracking-wider mb-2">
                        Bring Your Own Key (Gemini API)
                      </label>
                      <input 
                        type="password"
                        value={apiKey}
                        onChange={handleSaveKey}
                        placeholder="AIzaSy..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edu-green-light bg-white text-sm"
                      />
                      <p className="text-xs text-edu-text mt-2 font-medium">
                        Stored securely in your local browser. If left blank, uses the system key.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50/80 rounded-b-[1.5rem] border-t border-gray-100 gap-4 sm:gap-0">
                  
                  {/* Settings Toggle Button */}
                  <button 
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${showSettings ? 'bg-edu-green-pale text-edu-green-dark' : 'text-edu-text hover:bg-white hover:shadow-sm'}`}
                  >
                    <span className="text-lg leading-none">⚙</span> API Settings
                  </button>

                  <button 
                    type="submit"
                    disabled={!prompt.trim()}
                    className={`px-8 py-3 rounded-xl font-bold transition-all transform flex items-center gap-2 ${
                      prompt.trim() 
                        ? "bg-edu-green-dark text-white hover:bg-edu-olive hover:-translate-y-0.5 hover:shadow-lg" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span>✦</span> weave module
                  </button>
                </div>
              </form>

            </motion.div>

          ) : (
            // --- GENERATING STATE ---
            <motion.div 
              key="loading-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white"
            >
              <div className="relative w-24 h-24 mb-12">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      rotate: [0, 90, 90, 180, 180, 270, 270, 360],
                      scale: [1, 0.8, 1, 0.8, 1, 0.8, 1, 0.8, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], delay: i * 0.2 }}
                    className={`absolute w-10 h-10 rounded-xl ${
                      i === 0 ? "bg-edu-green top-0 left-0" :
                      i === 1 ? "bg-edu-green-light top-0 right-0" :
                      i === 2 ? "bg-edu-green-dark bottom-0 left-0" :
                      "bg-edu-green-pale bottom-0 right-0 border border-edu-green/20"
                    }`}
                    style={{ transformOrigin: "12px 12px" }}
                  />
                ))}
              </div>

              <h2 className="text-2xl font-bold text-edu-olive mb-2">weaving your module...</h2>
              
              <div className="h-8 overflow-hidden relative w-full max-w-sm text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeStep}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-edu-text font-medium absolute w-full"
                  >
                    {loadingSteps[activeStep]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full mt-8 overflow-hidden relative">
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-edu-green-dark rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((activeStep + 1) / loadingSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}