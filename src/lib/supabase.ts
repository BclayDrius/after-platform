// Supabase client configuration
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Debug logging
console.log("Supabase Config:", {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey.length,
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Please check your environment variables."
  );
  console.error("URL:", supabaseUrl);
  console.error("Key exists:", !!supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        mode: "cors",
        credentials: "omit",
      });
    },
  },
});

// Simple user interface for now
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin";
  specialty?: string;
  aura: number;
  courses_completed: number;
  hours_studied: number;
  created_at: string;
}
