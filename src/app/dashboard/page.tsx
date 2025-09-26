"use client";

import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { roleService, User } from "@/services/roleService";
import RoleManager from "@/components/RoleManager";
import CourseManager from "@/components/CourseManager";
import styles from "./dashboard.module.scss";
import PageLayout from "@/components/PageLayout";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "users">(
    "overview"
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await roleService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Cargando...">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Cargando...</div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!currentUser) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Error">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error al cargar usuario</div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }
  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title="Dashboard">
        <main className={styles.content}>
          <div className={styles.greeting}>
            <h2>¡Bienvenido de vuelta, {currentUser.first_name}!</h2>
            <p>
              {currentUser.role === "admin" &&
                "Panel de administración - Gestiona usuarios y cursos"}
              {currentUser.role === "teacher" &&
                "Panel de profesor - Gestiona tus cursos y estudiantes"}
              {currentUser.role === "student" &&
                "Continúa tu camino de aprendizaje donde lo dejaste"}
            </p>
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser.role === "admin"
                    ? "bg-red-100 text-red-800"
                    : currentUser.role === "teacher"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {currentUser.role === "admin"
                  ? "Administrador"
                  : currentUser.role === "teacher"
                  ? "Profesor"
                  : "Estudiante"}
              </span>
            </div>
          </div>

          {/* Navigation tabs for admin and teachers */}
          {["admin", "teacher"].includes(currentUser.role) && (
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "overview"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Resumen
                  </button>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "courses"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Cursos
                  </button>
                  {currentUser.role === "admin" && (
                    <button
                      onClick={() => setActiveTab("users")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "users"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Usuarios
                    </button>
                  )}
                </nav>
              </div>
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === "courses" &&
            ["admin", "teacher"].includes(currentUser.role) && (
              <CourseManager currentUser={currentUser} />
            )}

          {activeTab === "users" && currentUser.role === "admin" && (
            <RoleManager currentUser={currentUser} />
          )}

          {activeTab === "overview" && (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{currentUser.aura}</h3>
                    <p>Aura Total</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2v20m8-18H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{currentUser.courses_completed}</h3>
                    <p>Cursos Completados</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{currentUser.hours_studied}h</h3>
                    <p>Tiempo Estudiado</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{currentUser.specialty || "No definida"}</h3>
                    <p>Especialidad</p>
                  </div>
                </div>
              </div>

              <div className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <div className={styles.courseBadge}>En Progreso</div>
                  <button className={styles.courseMenu}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>
                <div className={styles.courseInfo}>
                  <h3>JavaScript Fundamentals</h3>
                  <p>
                    Domina los conceptos básicos de JavaScript y construye
                    aplicaciones web modernas
                  </p>
                  <div className={styles.progressSection}>
                    <div className={styles.progressCircle}>
                      <svg
                        className={styles.progressRing}
                        width="120"
                        height="120"
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#333333"
                          strokeWidth="8"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray="314"
                          strokeDashoffset="150"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#cccccc" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className={styles.progressContent}>
                        <div className={styles.progressValue}>52%</div>
                        <div className={styles.progressLabel}>Completado</div>
                      </div>
                    </div>
                    <div className={styles.courseDetails}>
                      <div className={styles.courseStats}>
                        <div className={styles.stat}>
                          <div className={styles.statIcon}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </div>
                          <span>52 de 100 lecciones</span>
                        </div>
                        <div className={styles.stat}>
                          <div className={styles.statIcon}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12,6 12,12 16,14" />
                            </svg>
                          </div>
                          <span>60 min por clase</span>
                        </div>
                        <div className={styles.stat}>
                          <div className={styles.statIcon}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                            </svg>
                          </div>
                          <span>Nivel: Principiante</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.courseActions}>
                  <div className={styles.nextClass}>
                    <div className={styles.nextClassInfo}>
                      <span className={styles.nextClassLabel}>
                        🎉 ¡Estás al día!
                      </span>
                      <span className={styles.nextClassDate}>
                        Próxima clase: 06 de Agosto, 2025
                      </span>
                    </div>
                    <button className={styles.continueBtn}>
                      <span>Continuar Curso</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.sectionsGrid}>
                <div className={styles.learningPath}>
                  <div className={styles.sectionHeader}>
                    <h3>Ruta de Aprendizaje</h3>
                    <button className={styles.sectionAction}>Ver todo</button>
                  </div>
                  <p>
                    Cursos personalizados para alcanzar tus metas profesionales
                  </p>

                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <h4>Crea tu primera ruta</h4>
                    <p>Personaliza tu experiencia de aprendizaje</p>
                    <button className={styles.createPathBtn}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      Crear Ruta de Aprendizaje
                    </button>
                  </div>
                </div>

                <div className={styles.recentActivity}>
                  <div className={styles.sectionHeader}>
                    <h3>Actividad Reciente</h3>
                    <button className={styles.sectionAction}>Ver todo</button>
                  </div>
                  <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="9,11 12,14 22,4" />
                          <path d="M21,12v7a2,2 0,0,1-2,2H5a2,2 0,0,1-2-2V5a2,2 0,0,1,2-2h11" />
                        </svg>
                      </div>
                      <div className={styles.activityContent}>
                        <p>Completaste "Variables y Tipos de Datos"</p>
                        <span>Hace 2 horas</span>
                      </div>
                    </div>
                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      </div>
                      <div className={styles.activityContent}>
                        <p>Obtuviste el logro "Primera Semana"</p>
                        <span>Ayer</span>
                      </div>
                    </div>
                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 9V5a3 3 0 0 0-6 0v4" />
                          <rect
                            x="2"
                            y="9"
                            width="20"
                            height="12"
                            rx="2"
                            ry="2"
                          />
                        </svg>
                      </div>
                      <div className={styles.activityContent}>
                        <p>Desbloqueaste "Funciones Avanzadas"</p>
                        <span>Hace 3 días</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </PageLayout>
    </AuthGuard>
  );
}
