"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./PageLayout.module.scss";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
}

const PageLayout = ({
  title,
  children,
  showBackButton = true,
}: PageLayoutProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      // Force redirect even if logout fails
      window.location.href = "/login";
    }
  };

  return (
    <div className={styles.pageLayout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {showBackButton && (
            <button
              className={styles.menuToggle}
              onClick={handleBack}
              title="Volver"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <h1 className={styles.title}>{title}</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchBar}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input id="searBar" type="text" placeholder="Buscar..." />
          </div>
          <button className={styles.notificationBtn}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className={styles.notificationDot}></span>
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Cerrar Sesión
          </button>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              <span>👤</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
};

export default PageLayout;
