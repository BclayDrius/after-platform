"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import { mockCourseService } from "@/utils/mockCourseData";
import styles from "./course.module.scss";

interface CourseWeek {
  week: number;
  title: string;
  description: string;
  status: "completed" | "current" | "locked";
  lessons: number;
  duration: string;
  topics: string[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: string;
  progress: number;
  totalWeeks: number;
  weeks: CourseWeek[];
}

export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const courseData = await mockCourseService.getCourseById(courseId);
        setCourse(courseData);
      } catch (err) {
        setError("Curso no encontrado");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Cargando curso...">
          <div className={styles.loading}>
            <p>Cargando contenido del curso...</p>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (error || !course) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Error">
          <div className={styles.error}>
            <h2>Curso no encontrado</h2>
            <p>El curso que buscas no existe o no tienes acceso a él.</p>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title={course.title}>
        <div className={styles.courseContainer}>
          {/* Header del curso */}
          <div className={styles.courseHeader}>
            <div className={styles.courseInfo}>
              <h1>{course.title}</h1>
              <p className={styles.courseDescription}>{course.description}</p>
              <div className={styles.courseMeta}>
                <span className={styles.instructor}>
                  👨‍🏫 {course.instructor}
                </span>
                <span className={styles.level}>📊 {course.level}</span>
                <span className={styles.duration}>⏱️ {course.duration}</span>
              </div>
            </div>
            <div className={styles.courseProgress}>
              <div className={styles.progressCircle}>
                <svg width="120" height="120" className={styles.progressSvg}>
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="8"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (314 * course.progress) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className={styles.progressText}>
                  <span className={styles.progressValue}>
                    {course.progress}%
                  </span>
                  <span className={styles.progressLabel}>Completado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de semanas */}
          <div className={styles.weeksSection}>
            <h2>Contenido del Curso - {course.totalWeeks} Semanas</h2>
            <div className={styles.weeksGrid}>
              {course.weeks.map((week) => (
                <div
                  key={week.week}
                  className={`${styles.weekCard} ${styles[week.status]}`}
                >
                  <div className={styles.weekHeader}>
                    <span className={styles.weekNumber}>
                      Semana {week.week}
                    </span>
                    <div className={styles.weekStatus}>
                      {week.status === "completed" && "✅"}
                      {week.status === "current" && "🔄"}
                      {week.status === "locked" && "🔒"}
                    </div>
                  </div>

                  <h3 className={styles.weekTitle}>{week.title}</h3>
                  <p className={styles.weekDescription}>{week.description}</p>

                  <div className={styles.weekMeta}>
                    <span className={styles.lessons}>
                      📚 {week.lessons} lecciones
                    </span>
                    <span className={styles.duration}>⏱️ {week.duration}</span>
                  </div>

                  <div className={styles.weekTopics}>
                    <h4>Temas:</h4>
                    <ul>
                      {week.topics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`${styles.weekButton} ${
                      week.status === "locked" ? styles.disabled : ""
                    }`}
                    disabled={week.status === "locked"}
                    onClick={() => {
                      if (week.status !== "locked") {
                        window.location.href = `/courses/${courseId}/${week.week}`;
                      }
                    }}
                  >
                    {week.status === "completed" && "Revisar"}
                    {week.status === "current" && "Continuar"}
                    {week.status === "locked" && "Bloqueado"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className={styles.courseFooter}>
            <div className={styles.courseStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {course.weeks.filter((w) => w.status === "completed").length}
                </span>
                <span className={styles.statLabel}>Semanas Completadas</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {course.weeks.reduce((acc, w) => acc + w.lessons, 0)}
                </span>
                <span className={styles.statLabel}>Total de Lecciones</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{course.totalWeeks}</span>
                <span className={styles.statLabel}>Semanas Totales</span>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
