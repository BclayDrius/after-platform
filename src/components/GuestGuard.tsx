"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingSpinner from "./LoadingSpinner";

interface GuestGuardProps {
  children: React.ReactNode;
}

const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Usuario ya está autenticado, redirigir al dashboard
          console.log("User already authenticated, redirecting to dashboard");
          router.push("/dashboard");
          return;
        }

        setIsGuest(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsGuest(true);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Si el usuario se autentica, redirigir
        router.push("/dashboard");
      } else {
        setIsGuest(true);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)",
        }}
      >
        <LoadingSpinner size="large" text="Verificando autenticación..." />
      </div>
    );
  }

  if (!isGuest) {
    // Mientras redirige, mostrar loading
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)",
        }}
      >
        <LoadingSpinner size="large" text="Redirigiendo al dashboard..." />
      </div>
    );
  }

  return <>{children}</>;
};

export default GuestGuard;
