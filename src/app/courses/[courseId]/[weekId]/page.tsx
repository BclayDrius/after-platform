"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import { mockCourseService } from "@/utils/mockCourseData";
import styles from "./week.module.scss";

interface Lesson {
  id: number;
  title: string;
  type: "video" | "reading" | "exercise" | "quiz";
  duration: string;
  completed: boolean;
  description: string;
}

interface WeekData {
  week: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: Lesson[];
  resources: Array<{
    title: string;
    type: string;
    url: string;
  }>;
  assignment?: {
    title: string;
    description: string;
    dueDate: string;
  };
}

function WeekPageContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const weekId = parseInt(params.weekId as string);

  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeek = async () => {
      try {
        const data = await mockCourseService.getWeekContent(courseId, weekId);
        setWeekData(data);
      } catch (err) {
        setError("Contenido de la semana no encontrado");
      } finally {
        setLoading(false);
      }
    };

    loadWeek();
  }, [courseId, weekId]);

  const handleLessonComplete = (lessonId: number) => {
    if (weekData) {
      const updatedLessons = weekData.lessons.map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, completed: !lesson.completed }
          : lesson
      );
      setWeekData({ ...weekData, lessons: updatedLessons });
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Cargando...">
          <div className={styles.loading}>
            <p>Cargando contenido de la semana...</p>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (error || !weekData) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Error">
          <div className={styles.error}>
            <h2>Contenido no encontrado</h2>
            <p>La semana que buscas no existe o no tienes acceso a ella.</p>
            <button onClick={() => router.back()} className={styles.backButton}>
              Volver al curso
            </button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const completedLessons = weekData.lessons.filter((l) => l.completed).length;
  const progressPercentage = (completedLessons / weekData.lessons.length) * 100;

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title={`Semana ${weekData.week}: ${weekData.title}`}>
        <div className={styles.weekContainer}>
          {/* Navegación */}
          <div className={styles.navigation}>
            <button onClick={() => router.back()} className={styles.backButton}>
              ← Volver al curso
            </button>
            <div className={styles.weekProgress}>
              <span>
                Progreso: {completedLessons}/{weekData.lessons.length} lecciones
              </span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Header de la semana */}
          <div className={styles.weekHeader}>
            <div className={styles.weekInfo}>
              <h1>
                Semana {weekData.week}: {weekData.title}
              </h1>
              <p className={styles.weekDescription}>{weekData.description}</p>
            </div>
            <div className={styles.weekStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {weekData.lessons.length}
                </span>
                <span className={styles.statLabel}>Lecciones</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {Math.round(progressPercentage)}%
                </span>
                <span className={styles.statLabel}>Completado</span>
              </div>
            </div>
          </div>

          {/* Objetivos */}
          <div className={styles.objectives}>
            <h2>Objetivos de Aprendizaje</h2>
            <ul>
              {weekData.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>

          {/* Lecciones */}
          <div className={styles.lessonsSection}>
            <h2>Lecciones</h2>
            <div className={styles.lessonsList}>
              {weekData.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`${styles.lessonCard} ${
                    lesson.completed ? styles.completed : ""
                  }`}
                >
                  <div className={styles.lessonHeader}>
                    <div className={styles.lessonType}>
                      {lesson.type === "video" && "🎥"}
                      {lesson.type === "reading" && "📖"}
                      {lesson.type === "exercise" && "💻"}
                      {lesson.type === "quiz" && "❓"}
                    </div>
                    <div className={styles.lessonInfo}>
                      <h3>{lesson.title}</h3>
                      <p>{lesson.description}</p>
                    </div>
                    <div className={styles.lessonMeta}>
                      <span className={styles.duration}>{lesson.duration}</span>
                      <button
                        className={`${styles.completeButton} ${
                          lesson.completed ? styles.completed : ""
                        }`}
                        onClick={() => handleLessonComplete(lesson.id)}
                      >
                        {lesson.completed ? "✓" : "○"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recursos adicionales */}
          {weekData.resources.length > 0 && (
            <div className={styles.resourcesSection}>
              <h2>Recursos Adicionales</h2>
              <div className={styles.resourcesList}>
                {weekData.resources.map((resource, index) => (
                  <div key={index} className={styles.resourceCard}>
                    <div className={styles.resourceIcon}>
                      {resource.type === "pdf" && "📄"}
                      {resource.type === "link" && "🔗"}
                      {resource.type === "tool" && "🛠️"}
                      {resource.type === "book" && "📚"}
                    </div>
                    <div className={styles.resourceInfo}>
                      <h4>{resource.title}</h4>
                      <span className={styles.resourceType}>
                        {resource.type}
                      </span>
                    </div>
                    <button className={styles.resourceButton}>Abrir</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tarea (si existe) */}
          {weekData.assignment && (
            <div className={styles.assignmentSection}>
              <h2>Tarea de la Semana</h2>
              <div className={styles.assignmentCard}>
                <div className={styles.assignmentHeader}>
                  <h3>{weekData.assignment.title}</h3>
                  <span className={styles.dueDate}>
                    Entrega: {weekData.assignment.dueDate}
                  </span>
                </div>
                <p>{weekData.assignment.description}</p>
                <button className={styles.assignmentButton}>
                  Ver Detalles de la Tarea
                </button>
              </div>
            </div>
          )}

          {/* Navegación entre semanas */}
          <div className={styles.weekNavigation}>
            <button
              className={styles.navButton}
              onClick={() => router.push(`/courses/${courseId}/${weekId - 1}`)}
              disabled={weekId <= 1}
            >
              ← Semana Anterior
            </button>
            <button
              className={styles.navButton}
              onClick={() => router.push(`/courses/${courseId}/${weekId + 1}`)}
              disabled={weekId >= 12}
            >
              Siguiente Semana →
            </button>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
export default function WeekPage() {
  return (
    <Suspense fallback={<div>Loading week content...</div>}>
      <WeekPageContent />
    </Suspense>
  );
}
