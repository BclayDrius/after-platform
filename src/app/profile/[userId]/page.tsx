"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import styles from "../profile.module.scss";

const API_URL = "http://127.0.0.1:8000/api";

interface UserProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  birthday?: string;
  specialty?: string;
  aura?: number | string;
  ranking?: number | string; // el rango del usuario
  courses_completed?: number;
  hours_studied?: number;
  member_since?: string;
}

function ProfilePageContent() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No token found");

        const res = await fetch(`${API_URL}/students/profile/${userId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error fetching profile: ${res.status}`);
        }

        const data = await res.json();
        console.log("Perfil data:", data); // verifica qué campos vienen realmente

        setUser({
          first_name: data.first_name || "Sin nombre",
          last_name: data.last_name || "",
          email: data.email || "Sin email",
          birthday: data.birthday || "No registrado",
          specialty: data.specialty || "No definida",
          aura: data.aura ?? "N/A",
          ranking: data.ranking ?? "N/A", // asegúrate que la API devuelva exactamente 'ranking'
          courses_completed: data.courses_completed ?? 0,
          hours_studied: data.hours_studied ?? 0,
          member_since: data.member_since || "N/A",
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading)
    return (
      <PageLayout title="Profile">
        <p>Loading...</p>
      </PageLayout>
    );
  if (error || !user)
    return (
      <PageLayout title="Profile">
        <p>{error || "No se pudo cargar el perfil"}</p>
      </PageLayout>
    );

  return (
    <>
      <Sidebar />
      <PageLayout title="Profile">
        <div className={styles.profileContainer}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                <span>👤</span>
              </div>
              <div className={styles.profileInfo}>
                <h2>
                  {user.first_name} {user.last_name}
                </h2>
                <p>Email: {user.email}</p>
                <span className={styles.memberSince}>
                  Member since {user.member_since}
                </span>
                <p>Especialidad: {user.specialty}</p>
                <p>Cumpleaños: {user.birthday}</p>
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
                <span className={styles.statValue}>{user.hours_studied}</span>
                <span className={styles.statLabel}>Horas Estudiadas</span>
              </div>
            </div>

            <div className={styles.settingsCard}>
              <button
                className={styles.logoutBtn}
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("userId");
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
