"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/services/authService";
import LoadingSpinner from "./LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

interface UserProfile {
  id: number;
  username: string;
  role: "student" | "teacher" | "admin";
}

function parseJwt(token: string): UserProfile | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authStorage.isAuthenticated();
      const userId = authStorage.getCurrentUserId();

      if (!isAuth || !userId) {
        setIsAuthenticated(false);
        setIsLoading(false);
        if (requireAuth) {
          // Redirigir al login después de un breve delay para mostrar el loading
          setTimeout(() => {
            router.push(
              "/login?redirect=" + encodeURIComponent(window.location.pathname)
            );
          }, 1000);
        }
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, router]);

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

  if (requireAuth && !isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ color: "#000000", marginBottom: "16px" }}>
            Acceso Restringido
          </h2>
          <p style={{ color: "#374151", marginBottom: "24px" }}>
            Necesitas iniciar sesión para acceder a esta página.
          </p>
          <LoadingSpinner size="medium" text="Redirigiendo al login..." />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
