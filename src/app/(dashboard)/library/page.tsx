"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// Define the type based on our database schema
interface Lesson {
  id: string;
  title: string;
  created_at: string;
  progress: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Verify the user is actually logged in
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // If not logged in, boot them back to the login screen
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      // 2. Fetch THEIR specific lessons from the database, newest first
      // Row Level Security (RLS) guarantees they only see their own rows
      const { data: fetchedLessons, error: dbError } = await supabase
        .from("lessons")
        .select("id, title, created_at, progress")
        .order("created_at", { ascending: false });

      if (!dbError && fetchedLessons) {
        setLessons(fetchedLessons);
      }
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Helper to keep the grid colorful and organic
  const getCardColor = (index: number) => {
    const colors = ["bg-edu-green-pale", "bg-white", "bg-[#FFFDF5]"];
    return colors[index % colors.length];
  };

  // Helper to format the Supabase timestamp into a readable date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Generate initials from the user's email
  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "ME";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-edu-green-pale border-t-edu-green-dark rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 px-4 sm:px-8 pb-24 relative z-10 max-w-7xl mx-auto">
      
      {/* Dashboard Top Nav */}
      <nav className="w-full flex justify-between items-center mb-16 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-edu-olive">
            eduweave
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-edu-text font-medium">library</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={handleSignOut} className="text-sm font-medium text-edu-text hover:text-red-500 transition-colors">
            sign out
          </button>
          <div className="w-10 h-10 rounded-full bg-edu-green-light flex items-center justify-center text-edu-olive font-bold border-2 border-white shadow-sm uppercase">
            {initials}
          </div>
        </div>
      </nav>

      {/* Header & Call to Action */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-edu-olive mb-2">welcome back.</h1>
          <p className="text-edu-text">Pick up where you left off, or weave something new.</p>
        </div>
        
        <Link 
          href="/studio" 
          className="bg-edu-olive text-white px-8 py-4 rounded-2xl font-bold hover:bg-edu-green-dark transition-all transform hover:-translate-y-1 shadow-lg flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> new module
        </Link>
      </header>

      {/* Empty State vs Grid */}
      {lessons.length === 0 ? (
        <div className="w-full bg-[#FFFDF5] border border-[#EBE7D9] rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="text-6xl mb-6">📝</div>
          <h2 className="text-2xl font-bold text-edu-olive mb-2">Your library is empty.</h2>
          <p className="text-edu-text max-w-md mb-8">You haven't generated any visual learning modules yet. Head over to the studio to weave your first one.</p>
          <Link href="/studio" className="bg-edu-green-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-edu-olive transition-colors">
            Go to Studio
          </Link>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {lessons.map((lesson, index) => (
            <Link href={`/lesson/${lesson.id}`} key={lesson.id} className="block group h-full">
              <div className={`p-8 rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 h-full flex flex-col justify-between ${getCardColor(index)}`}>
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-edu-text/60 uppercase tracking-wider">{formatDate(lesson.created_at)}</span>
                    {lesson.progress === 100 && (
                      <span className="bg-edu-green text-white text-xs px-2 py-1 rounded-full font-bold">completed</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-edu-olive mb-4 group-hover:text-edu-green-dark transition-colors line-clamp-3">
                    {lesson.title}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs text-edu-text font-medium mb-2">
                    <span>progress</span>
                    <span>{lesson.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-edu-green-dark rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
                  </div>
                </div>
                
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}