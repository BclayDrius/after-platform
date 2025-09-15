"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabase() {
  const [status, setStatus] = useState("Testing...");
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        setConfig({
          url: url,
          hasKey: !!key,
          keyLength: key?.length || 0,
          keyStart: key?.substring(0, 20) + "...",
        });

        // Test basic connection
        const { data, error } = await supabase
          .from("users")
          .select("count")
          .limit(1);

        if (error) {
          setStatus(`Error: ${error.message}`);
        } else {
          setStatus("✅ Connection successful!");
        }
      } catch (err) {
        setStatus(`❌ Connection failed: ${err}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Supabase Connection Test</h1>

      <h2>Configuration:</h2>
      <pre>{JSON.stringify(config, null, 2)}</pre>

      <h2>Connection Status:</h2>
      <p>{status}</p>

      <h2>Instructions:</h2>
      <ol>
        <li>Check if URL and key are loaded correctly above</li>
        <li>
          If URL is empty, restart your dev server: <code>npm run dev</code>
        </li>
        <li>If key is missing, check your .env.local file</li>
        <li>Make sure you ran the SQL setup in Supabase</li>
      </ol>
    </div>
  );
}
