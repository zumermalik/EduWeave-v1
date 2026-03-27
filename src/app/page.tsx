"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Caveat } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

// Initialize the handwriting font
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

// --- Strongly Typed Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

// --- The Interactive Hero Blueprint Background ---
const HeroPipelineBackground = () => {
  // Define main concept nodes and their initial positions/sizes
  const concepts = [
    { id: 'text', label: "Text Ingestion", x: 15, y: 40, size: 60, type: 'start' },
    { id: 'mech', label: "Mechanics", x: 45, y: 25, size: 90, type: 'gear' },
    { id: 'chem', label: "Chemistry", x: 75, y: 35, size: 80, type: 'atom' },
    { id: 'phys', label: "Physics", x: 85, y: 65, size: 70, type: 'cube' },
    { id: 'mod',  label: "MODULE", x: 50, y: 80, size: 100, type: 'end' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <svg className="absolute w-full h-full opacity-70">
        {/* The roughness filter */}
        <defs>
          <filter id="pencilTexture">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        
        {/* Connecting Line (drawn first so it stays under nodes) */}
        <motion.path
          d="M 15 40 L 45 25 L 75 35 L 85 65 L 50 80"
          stroke="#4A4737"
          strokeWidth="1.5"
          strokeOpacity="0.15"
          fill="none"
          filter="url(#pencilTexture)"
          className="pointer-events-auto"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          whileHover={{ stroke: "#8BCC3B", strokeWidth: 3, strokeOpacity: 0.8 }}
        />

        {/* The concept nodes */}
        {concepts.map((node) => (
          <motion.g
            key={node.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="pointer-events-auto cursor-pointer group"
          >
            {/* The main hit area (pencil style) */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size / 2}
              fill="transparent"
              stroke="#4A4737"
              strokeWidth="1.5"
              strokeOpacity="0.3"
              filter="url(#pencilTexture)"
              className="transition-all duration-300"
              whileHover={{
                scale: 1.25,
                stroke: "#8BCC3B", // Floods with green
                strokeWidth: 4,
                strokeOpacity: 1,
                fill: "rgba(139, 204, 59, 0.1)",
                filter: "none", // Remves pencil roughness to feel "alive" and digital
              }}
            />
            
            {/* 3D Visualizer effect - hidden by default, expands on hover */}
            {/* Requires SVG icons/paths for the gear, atom, etc., which are omitted for length */}
            {/* Instead, we use an abstract floating effect */}
            <motion.circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={node.size / 2}
                fill="#8BCC3B"
                className="opacity-0 group-hover:opacity-10 shadow-2xl transition-opacity"
            />
            
            <motion.text
              x={`${node.x}%`}
              y={`${node.y + (node.size / 2) + 10}%`}
              textAnchor="middle"
              className={`text-2xl text-edu-green-dark rotate-[-5deg] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${caveat.className}`}
            >
              visualizing {node.label}...
            </motion.text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default function Home() {
  // --- AUTH STATE LOGIC ---
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      // Check if there is an active session cookie
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || null);
      }
    };
    checkUser();
  }, [supabase]);

  // Generate initials for the avatar
  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "";

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 px-4 sm:px-8 relative z-10 overflow-hidden">
      
      {/* 2.5D BACKGROUND LAYER (NEW) */}
      <HeroPipelineBackground />

      {/* 1. NAVIGATION - Elevated z-index */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex justify-between items-center mb-32 relative z-20"
      >
        <Link href="/docs" className="text-edu-text hover:text-edu-olive font-medium transition-colors bg-white/60 px-4 py-1.5 rounded-xl backdrop-blur-sm border border-white/40">
          read doc
        </Link>
        
        {/* DYNAMIC AUTH NAVIGATION */}
        <div className="flex items-center gap-6">
          {userEmail ? (
            <>
              <Link href="/library" className="text-edu-text hover:text-edu-olive font-medium transition-colors">
                library
              </Link>
              <Link href="/studio" className="text-edu-text hover:text-edu-olive font-medium transition-colors">
                studio
              </Link>
              <Link href="/library" className="w-10 h-10 rounded-full bg-edu-green-light flex items-center justify-center text-edu-olive font-bold border-2 border-white shadow-sm uppercase hover:scale-105 transition-transform">
                {initials}
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup" className="text-edu-text hover:text-edu-olive font-medium transition-colors">
                sign up
              </Link>
              <Link href="/login" className="bg-edu-green-dark text-white px-6 py-2 rounded-xl font-medium hover:bg-edu-olive transition-transform hover:-translate-y-0.5 shadow-sm">
                log in
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* 2. HERO SECTION - Clean layout with 3D Image Stack */}
      <motion.header 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="w-full max-w-5xl flex flex-col items-center text-center mb-32 relative z-20"
      >
        <motion.h1 variants={fadeInUp} className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-edu-olive mb-2 drop-shadow-sm">
          eduweave
        </motion.h1>
        <motion.p variants={fadeInUp} className="text-xl sm:text-2xl text-edu-olive tracking-tight mb-16 font-light bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-white/40 shadow-sm">
          visualize anything that you read
        </motion.p>

        {/* 3D STACKED IMAGE OVERVIEW */}
        <motion.div 
          variants={fadeInUp}
          className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center group"
        >
          {/* Left Image: Sky (Tucked behind, slightly rotated) */}
          <div className="absolute left-0 sm:left-4 md:left-8 w-[45%] md:w-[40%] aspect-[16/9] rounded-3xl overflow-hidden shadow-xl border border-white/50 z-10 transform -rotate-3 -translate-x-4 scale-90 opacity-80 transition-all duration-700 group-hover:-translate-x-8 group-hover:-rotate-6 group-hover:opacity-100 hover:!z-30 hover:!scale-105">
            <Image
              src="/images/placeholder-sky.png"
              alt="Sky Visualization"
              fill
              className="object-cover"
            />
          </div>

          {/* Right Image: RNA (Tucked behind, slightly rotated) */}
          <div className="absolute right-0 sm:right-4 md:right-8 w-[45%] md:w-[40%] aspect-[16/9] rounded-3xl overflow-hidden shadow-xl border border-white/50 z-10 transform rotate-3 translate-x-4 scale-90 opacity-80 transition-all duration-700 group-hover:translate-x-8 group-hover:rotate-6 group-hover:opacity-100 hover:!z-30 hover:!scale-105">
            <Image
              src="/images/RNA.png"
              alt="RNA Structure Visualization"
              fill
              className="object-cover"
            />
          </div>

          {/* Center Main Image: BC2 (Front and center) */}
          <div className="relative w-[60%] md:w-[55%] aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/80 z-20 transform transition-all duration-700 group-hover:scale-105">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.3)] z-10 pointer-events-none rounded-[2.5rem]"></div>
            <Image
              src="/images/bc2.png"
              alt="EduWeave Main Interface"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </motion.header>

      {/* 3. THE ORIGIN STORY (AESTHETIC NOTEBOOK STYLE) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="w-full max-w-5xl mb-32 flex flex-col items-center relative z-20"
      >
        {/* Decorative Tape Graphic */}
        <div className="absolute -top-4 z-20 w-32 h-8 bg-white/40 backdrop-blur-md rotate-2 border border-white/20 shadow-sm"></div>

        <div className="w-full max-w-4xl bg-[#FFFDF5] p-10 md:p-16 rounded-sm shadow-xl border border-[#EBE7D9] relative transform -rotate-1 hover:rotate-0 transition-transform duration-500">
          {/* Notebook ruled lines background effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #8BCC3B 31px, #8BCC3B 32px)', backgroundPositionY: '8px' }}>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 space-y-8 pl-4 border-l-2 border-red-400/30">
              <h2 className={`text-4xl md:text-5xl font-bold text-edu-olive ${caveat.className}`}>
                the story behind the weave.
              </h2>
              
              <p className="text-edu-text leading-relaxed text-lg font-medium">
                When I used to read textbooks in school, I always had this intense desire to see the pages come alive. I didn't just want to read equations about fluid dynamics; I wanted to see the currents flowing in front of me.
              </p>

              {/* Handwritten annotation */}
              <div className="relative">
                <p className="text-edu-text leading-relaxed text-lg font-medium">
                  Creators like 3Blue1Brown revolutionized the way we see mathematics by making abstract concepts deeply visual and intuitive. I thought: <span className="font-bold text-edu-olive bg-edu-green-pale px-2 py-0.5 rounded">something like that should be instantly possible for science students.</span>
                </p>
                <div className={`absolute -right-8 -bottom-10 text-edu-green-dark text-2xl rotate-[-10deg] ${caveat.className}`}>
                  ↑ this was the spark!
                </div>
              </div>

              <p className={`text-3xl text-edu-olive leading-relaxed pt-6 ${caveat.className}`}>
                That is why EduWeave exists. <br/>
                To turn dead text into dynamic, living modules.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
      {/* 4. HOW IT WORKS (FLOWCHART) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="w-full max-w-5xl mb-32"
      >
        <div className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-edu-olive mb-4">how it works</motion.h2>
          <motion.p variants={fadeInUp} className="text-edu-text text-lg">from static text to interactive module in seconds.</motion.p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>

          {[
            { 
              step: 1, 
              title: "input your topic", 
              desc: "paste a textbook chapter or type a complex query like 'how do black holes work?'",
              bgClass: "bg-edu-green-pale border border-edu-green-light/30",
              badgeClass: "bg-white text-edu-green-dark shadow-sm",
              titleClass: "text-edu-olive",
              descClass: "text-edu-text"
            },
            { 
              step: 2, 
              title: "ai orchestration", 
              desc: "our agents parse the text, structure a lesson plan, and generate accurate diagrams.",
              bgClass: "bg-edu-green-light border border-edu-green/30",
              badgeClass: "bg-edu-olive text-white shadow-md",
              titleClass: "text-edu-olive",
              descClass: "text-edu-olive/80"
            },
            { 
              step: 3, 
              title: "learn & retain", 
              desc: "scroll through an interactive lesson and review auto-generated spaced-repetition flashcards.",
              bgClass: "bg-edu-green border border-edu-green-dark/30",
              badgeClass: "bg-white text-edu-green-dark shadow-md",
              titleClass: "text-edu-olive",
              descClass: "text-edu-olive/90"
            }
          ].map((item) => (
            <motion.div 
              key={item.step} 
              variants={fadeInUp} 
              className={`flex-1 p-8 rounded-3xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${item.bgClass}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-6 ${item.badgeClass}`}>
                {item.step}
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${item.titleClass}`}>{item.title}</h3>
              <p className={`text-sm leading-relaxed ${item.descClass}`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 5. FEATURES GRID */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="w-full max-w-5xl mb-32 bg-edu-olive rounded-[3rem] p-10 md:p-16 text-white shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-edu-green-dark rounded-full blur-[120px] opacity-20 -z-10 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="text-center mb-16 z-10 relative">
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">engineered for visual learners</motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-300 text-lg">stop reading walls of text. start seeing the concepts.</motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 relative">
          {[
            { title: "dynamic layouts", desc: "content automatically maps to the perfect UI—whether it's a timeline, a comparative table, or a visual diagram." },
            { title: "multimodal generation", desc: "we don't just generate text. our stack utilizes top-tier vision and image models to draft custom illustrations." },
            { title: "local & cloud ai", desc: "hybrid architecture routing simple queries to local instances and complex multimodal tasks to cloud providers." },
            { title: "auto-flashcards", desc: "every module ends with an automatically generated review deck to ensure you actually retain what you learned." }
          ].map((feature, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors group">
              <div className="text-edu-green-light text-2xl mb-4 transform group-hover:scale-110 transition-transform origin-left">✦</div>
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 6. BOTTOM CTA */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="w-full max-w-3xl mb-32 text-center relative z-20"
      >
        <h2 className="text-4xl font-bold text-edu-olive mb-6">ready to see your reading?</h2>
        <Link href="/signup" className="inline-block bg-edu-green text-edu-olive px-8 py-4 rounded-2xl font-bold text-lg hover:bg-edu-green-light transition-all hover:scale-105 hover:shadow-lg shadow-edu-green/20">
          start generating for free
        </Link>
      </motion.section>

      {/* 7. FOOTER */}
      <footer className="w-full max-w-5xl py-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-edu-text gap-4 mb-8 relative z-20">
        <p>© 2026 eduweave. all rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-edu-olive transition-colors">privacy</Link>
          <Link href="/terms" className="hover:text-edu-olive transition-colors">terms</Link>
          <Link href="/github" className="hover:text-edu-olive transition-colors">open source</Link>
        </div>
      </footer>
    </div>
  );
}