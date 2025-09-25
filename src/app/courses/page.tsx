"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import { authService } from "@/services/authService";
import { supabase } from "@/lib/supabase";
import styles from "./courses.module.scss";

interface Course {
  id: string;
  title: string;
  duration: number;
  level: string;
  status: string;
  progress: number;
  description: string;
  instructor: string;
  total_lessons?: number;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"enrolled" | "available">("enrolled");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        // Load enrolled courses
        const enrolledCourses = await authService.getStudentCourses();
        setCourses(enrolledCourses);

        // Load all available courses
        const availableCourses = await authService.getAllCourses();
        setAllCourses(availableCourses);
      } catch (err: unknown) {
        console.error("Error loading courses:", err);
        setError("Error al cargar los cursos");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      await authService.enrollInCourse(courseId);
      // Reload courses after enrollment
      const enrolledCourses = await authService.getStudentCourses();
      setCourses(enrolledCourses);
      alert("¡Te has inscrito exitosamente en el curso!");
    } catch (err: any) {
      alert(err.message || "Error al inscribirse en el curso");
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando cursos...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  const displayCourses = view === "enrolled" ? courses : allCourses;

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title="Cursos">
        <div className={styles.coursesContainer}>
          <div className={styles.coursesHeader}>
            <h2>Mis Cursos</h2>
            <div className={styles.viewToggle}>
              <button
                className={view === "enrolled" ? styles.active : ""}
                onClick={() => setView("enrolled")}
              >
                Inscritos ({courses.length})
              </button>
              <button
                className={view === "available" ? styles.active : ""}
                onClick={() => setView("available")}
              >
                Disponibles ({allCourses.length})
              </button>
            </div>
          </div>

          {displayCourses.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {view === "enrolled"
                  ? "No tienes cursos inscritos aún."
                  : "No hay cursos disponibles."}
              </p>
              {view === "enrolled" && (
                <button
                  onClick={() => setView("available")}
                  className={styles.browseBtn}
                >
                  Explorar Cursos Disponibles
                </button>
              )}
            </div>
          ) : (
            <div className={styles.coursesGrid}>
              {displayCourses.map((course) => (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.courseHeader}>
                    <h3>{course.title}</h3>
                    <span
                      className={`${styles.status} ${
                        styles[course.status.replace(" ", "").toLowerCase()]
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <p className={styles.courseDescription}>
                    {course.description}
                  </p>
                  <p className={styles.instructor}>👨‍🏫 {course.instructor}</p>

                  {view === "enrolled" && (
                    <div className={styles.courseProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className={styles.progressText}>
                        {course.progress}%
                      </span>
                    </div>
                  )}

                  <div className={styles.courseDetails}>
                    <div className={styles.detail}>
                      <span>⏱️</span> {course.duration} semanas
                    </div>
                    <div className={styles.detail}>
                      <span>📊</span> {course.level}
                    </div>
                    {course.total_lessons && (
                      <div className={styles.detail}>
                        <span>📚</span> {course.total_lessons} lecciones
                      </div>
                    )}
                  </div>

                  {view === "enrolled" ? (
                    <button
                      className={styles.continueBtn}
                      onClick={() =>
                        (window.location.href = `/courses/${course.id}`)
                      }
                    >
                      {course.progress === 0
                        ? "Comenzar"
                        : course.progress === 100
                        ? "Revisar"
                        : "Continuar"}
                    </button>
                  ) : (
                    <button
                      className={styles.enrollBtn}
                      onClick={() => handleEnroll(course.id)}
                    >
                      Inscribirse
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
