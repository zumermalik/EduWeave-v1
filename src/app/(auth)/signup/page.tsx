"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // Upon successful creation, send them straight to their new library!
      router.push("/library");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-black/5 flex flex-col items-center">
        
        <Link href="/" className="text-3xl font-bold tracking-tighter text-edu-olive mb-2 hover:opacity-80 transition-opacity">
          eduweave
        </Link>
        <p className="text-edu-text text-sm mb-8 font-medium">start visualizing your reading.</p>

        <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-edu-olive pl-1">email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edu-green-light focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            <label htmlFor="password" className="text-sm font-semibold text-edu-olive pl-1">create password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edu-green-light focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white py-3 rounded-xl font-medium transition-all transform flex justify-center items-center ${
              isLoading 
                ? "bg-edu-green-dark/70 cursor-not-allowed" 
                : "bg-edu-green-dark hover:bg-edu-olive hover:-translate-y-0.5"
            }`}
          >
            {isLoading ? "creating account..." : "create account"}
          </button>
        </form>

        <div className="mt-8 text-sm text-edu-text">
          already have an account?{" "}
          <Link href="/login" className="text-edu-green-dark font-semibold hover:underline">
            log in
          </Link>
        </div>
      </div>
    </div>
  );
}