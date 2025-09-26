"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { roleService } from "@/services/roleService";
import styles from "./profile.module.scss";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  birthday?: string;
  specialty?: string;
  aura?: number | string;
  ranking?: number | string;
  courses_completed?: number;
  hours_studied?: number;
  member_since?: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      console.log("Loading profile...");

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.log("No session found, redirecting...");
          setError("Debes iniciar sesión para ver tu perfil.");
          setLoading(false);
          return;
        }

        console.log("Session found, fetching profile for:", session.user.id);
        const profileData = await roleService.getCurrentUser();
        console.log("Profile data received:", profileData);

        if (profileData) {
          setUser({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email,
            specialty: profileData.specialty,
            aura: profileData.aura,
            ranking: 1, // We'll calculate this later
            courses_completed: profileData.courses_completed,
            hours_studied: profileData.hours_studied,
            member_since:
              profileData.created_at?.split("T")[0] ||
              new Date().toISOString().split("T")[0],
          });
        }
        setError(null);
      } catch (err) {
        console.error("Profile loading error:", err);
        setError(
          "Error al cargar el perfil. Por favor, inicia sesión nuevamente."
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title="Profile">
        <div className={styles.profileContainer}>
          {loading && (
            <div className={styles.loadingState}>
              <LoadingSpinner size="large" text="Cargando perfil..." />
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button
                className={styles.loginBtn}
                onClick={() => (window.location.href = "/login")}
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          )}

          {user && !loading && !error && (
            <>
              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <div className={styles.profileAvatar}>
                    <span>👤</span>
                  </div>
                  <div className={styles.profileInfo}>
                    <h2>
                      {user.first_name} {user.last_name}
                    </h2>
                    <p>{user.email}</p>
                    <span className={styles.memberSince}>
                      Member since {user.member_since}
                    </span>
                    <p>Especialidad: {user.specialty || "No definida"}</p>
                    <p>Cumpleaños: {user.birthday || "No registrado"}</p>
                  </div>
                </div>

                <div className={styles.profileStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>
                      {user.courses_completed}
                    </span>
                    <span className={styles.statLabel}>Cursos Completados</span>
                  </div>

                  <div className={styles.stat}>
                    <span className={styles.statValue}>{user.ranking}</span>
                    <span className={styles.statLabel}>Ranking</span>
                  </div>

                  <div className={styles.stat}>
                    <span className={styles.statValue}>{user.aura}</span>
                    <span className={styles.statLabel}>Aura</span>
                  </div>

                  <div className={styles.stat}>
                    <span className={styles.statValue}>
                      {user.hours_studied}
                    </span>
                    <span className={styles.statLabel}>Horas Estudiadas</span>
                  </div>
                </div>
              </div>

              <div className={styles.settingsCard}>
                <h3>Account Settings</h3>
                <div className={styles.settingItem}>
                  <span>Email Notifications</span>
                  <button className={styles.toggleBtn}>Enabled</button>
                </div>
                <div className={styles.settingItem}>
                  <span>Course Reminders</span>
                  <button className={styles.toggleBtn}>Enabled</button>
                </div>
                <div className={styles.settingItem}>
                  <span>Progress Reports</span>
                  <button className={styles.toggleBtn}>Weekly</button>
                </div>

                <div className={styles.settingItem}>
                  <button
                    className={styles.logoutBtn}
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/login";
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
