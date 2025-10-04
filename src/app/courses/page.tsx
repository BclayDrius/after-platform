"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import { roleService, Course, User } from "@/services/roleService";
import styles from "./courses.module.scss";
import Toast from "@/components/Toast";

interface CourseDisplay {
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
  const [courses, setCourses] = useState<CourseDisplay[]>([]);
  const [allCourses, setAllCourses] = useState<CourseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"enrolled" | "available">("enrolled");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, message: "", type: "success" });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const user = await roleService.getCurrentUser();
        setCurrentUser(user);

        if (!user) {
          setError("Usuario no autenticado");
          return;
        }

        let enrolledCourses: Course[] = [];
        let availableCourses: Course[] = [];

        if (user.role === "student") {
          // Estudiantes: ver cursos inscritos y disponibles
          enrolledCourses = await roleService.getStudentCourses();
          availableCourses = await roleService.getCourses();
        } else if (user.role === "teacher") {
          // Profesores: ver solo sus cursos
          enrolledCourses = await roleService.getCoursesByInstructor(user.id);
          availableCourses = enrolledCourses; // Los profesores solo ven sus cursos
        } else if (user.role === "admin") {
          // Admin: ver todos los cursos
          availableCourses = await roleService.getCourses();
          enrolledCourses = availableCourses; // Admin puede ver todos como "inscritos"
        }

        setCourses(
          enrolledCourses.map((course) => ({
            id: course.id,
            title: course.title,
            duration: course.duration_weeks,
            level: course.level,
            status: user.role === "student" ? "En Progreso" : "Gestionando",
            progress: user.role === "student" ? 0 : 100, // Admin/Teacher al 100%
            description: course.description || "",
            instructor: user.role === "student" ? "Instructor" : "Tú",
            total_lessons: course.total_lessons,
          }))
        );

        setAllCourses(
          availableCourses.map((course) => ({
            id: course.id,
            title: course.title,
            duration: course.duration_weeks,
            level: course.level,
            status: "Disponible",
            progress: 0,
            description: course.description || "",
            instructor: "Instructor",
            total_lessons: course.total_lessons,
          }))
        );
      } catch (err: unknown) {
        console.error("Error loading courses:", err);
        setError("Error al cargar los cursos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      if (!currentUser) {
        setToast({
          isOpen: true,
          message: "Debes estar autenticado para inscribirte",
          type: "warning",
        });
        return;
      }

      if (currentUser.role === "student") {
        // Los estudiantes pueden auto-inscribirse
        await roleService.enrollStudent(courseId, currentUser.id);
        setToast({
          isOpen: true,
          message: "¡Te has inscrito exitosamente en el curso!",
          type: "success",
        });

        // Recargar los cursos
        const enrolledCourses = await roleService.getStudentCourses();
        setCourses(
          enrolledCourses.map((course) => ({
            id: course.id,
            title: course.title,
            duration: course.duration_weeks,
            level: course.level,
            status: "En Progreso",
            progress: 0,
            description: course.description || "",
            instructor: "Instructor",
            total_lessons: course.total_lessons,
          }))
        );

        // Cambiar a la vista de cursos inscritos
        setView("enrolled");
      } else {
        // Admin y teachers pueden gestionar inscripciones desde el panel de administración
        setToast({
          isOpen: true,
          message:
            "Como administrador/profesor, puedes gestionar inscripciones desde el panel de gestión de cursos",
          type: "info",
        });
      }
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || "Error al inscribirse en el curso",
        type: "error",
      });
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
            <h2>
              {currentUser?.role === "admin"
                ? "Gestión de Cursos"
                : currentUser?.role === "teacher"
                ? "Mis Cursos"
                : "Mis Cursos"}
            </h2>
            <div className={styles.viewToggle}>
              <button
                className={view === "enrolled" ? styles.active : ""}
                onClick={() => setView("enrolled")}
              >
                {currentUser?.role === "student"
                  ? `Inscritos (${courses.length})`
                  : currentUser?.role === "teacher"
                  ? `Mis Cursos (${courses.length})`
                  : `Todos los Cursos (${courses.length})`}
              </button>
              {currentUser?.role === "student" && (
                <button
                  className={view === "available" ? styles.active : ""}
                  onClick={() => setView("available")}
                >
                  Disponibles ({allCourses.length})
                </button>
              )}
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
                      onClick={() => {
                        // Todos los roles van a la página individual del curso
                        window.location.href = `/courses/${course.id}`;
                      }}
                    >
                      {currentUser?.role === "student"
                        ? course.progress === 0
                          ? "Comenzar"
                          : course.progress === 100
                          ? "Revisar"
                          : "Continuar"
                        : "Gestionar Curso"}
                    </button>
                  ) : (
                    currentUser?.role === "student" && (
                      <button
                        className={styles.enrollBtn}
                        onClick={() => handleEnroll(course.id)}
                      >
                        Inscribirse
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toast de Notificaciones */}
        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({ isOpen: false, message: "", type: "success" })
          }
        />
      </PageLayout>
    </AuthGuard>
  );
}
