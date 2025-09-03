'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './profile.module.scss';

const API_URL = "http://127.0.0.1:8000/api";

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
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('accessToken');

    if (!userId || !token) {
      setError("Debes iniciar sesión para ver tu perfil.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/students/profile/${userId}/?token=${token}`)
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar el perfil");
        return res.json();
      })
      .then(data => {
        setUser({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          birthday: data.birthday,
          specialty: data.specialty,
          aura: data.aura ?? "N/A",
          ranking: data.ranking ?? "N/A",
          courses_completed: data.courses_completed ?? 0,
          hours_studied: data.hours_studied ?? 0,
          member_since: data.member_since ?? "N/A",
        });
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("Error al cargar el perfil. Por favor, inicia sesión nuevamente.");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
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
                onClick={() => window.location.href = '/login'}
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
                    <h2>{user.first_name} {user.last_name}</h2>
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
                    <span className={styles.statValue}>{user.courses_completed}</span>
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
                    onClick={() => {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                      localStorage.removeItem('userId');
                      localStorage.removeItem('userRole');
                      window.location.href = '/login';
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
    </>
  );
}
