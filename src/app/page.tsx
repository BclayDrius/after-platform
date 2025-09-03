"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import LandingPage from "@/components/LandingPage";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      // Verificar si el token es válido (opcional: hacer una llamada al API)
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Mostrar loading mientras se verifica la autenticación
  if (isAuthenticated === null) {
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
        <LoadingSpinner size="large" text="Cargando..." />
      </div>
    );
  }

  // Si está autenticado, mostrar el dashboard
  if (isAuthenticated) {
    return (
      <>
        <Sidebar />
        <MainContent />
      </>
    );
  }

  // Si no está autenticado, mostrar la landing page
  return <LandingPage />;
}
