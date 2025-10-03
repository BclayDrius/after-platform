"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import { roleService, Course, CourseWeek, User } from "@/services/roleService";
import styles from "./course.module.scss";

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditCourse, setShowEditCourse] = useState(false);

  const canEdit = () => {
    if (!currentUser || !course) return false;
    return (
      currentUser.role === "admin" ||
      (currentUser.role === "teacher" && course.creator_id === currentUser.id)
    );
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      const user = await roleService.getCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setError("Usuario no autenticado");
        return;
      }

      // Verificar acceso al curso
      const hasAccess = await roleService.canAccessCourse(courseId);
      if (!hasAccess) {
        setError("No tienes acceso a este curso");
        return;
      }

      // Cargar datos del curso
      const [courseData, weeksData] = await Promise.all([
        roleService
          .getCourses()
          .then((courses) => courses.find((c) => c.id === courseId)),
        roleService.getCourseWeeks(courseId),
      ]);

      if (!courseData) {
        setError("Curso no encontrado");
        return;
      }

      setCourse(courseData);
      setWeeks(weeksData);
    } catch (err: any) {
      console.error("Error loading course:", err);
      setError(err.message || "Error al cargar el curso");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (updates: Partial<Course>) => {
    if (!course) return;

    try {
      await roleService.updateCourse(course.id, updates);
      setCourse({ ...course, ...updates });
      setShowEditCourse(false);
      alert("Curso actualizado exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al actualizar el curso");
    }
  };

  const handleCreateWeek = async () => {
    if (!course) return;

    try {
      const weekNumber = weeks.length + 1;
      if (weekNumber > 12) {
        alert("No se pueden crear más de 12 semanas");
        return;
      }

      await roleService.createCourseWeek(course.id, {
        course_id: course.id,
        week_number: weekNumber,
        title: `Semana ${weekNumber}`,
        description: `Contenido de la semana ${weekNumber}`,
        objectives: [],
        topics: [],
        is_locked: weekNumber > 1,
        unlock_date:
          weekNumber === 1 ? new Date().toISOString().split("T")[0] : undefined,
      });

      await loadCourseData();
      alert("Semana creada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al crear la semana");
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Cargando...">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Cargando curso...</p>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Error">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/courses")}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Volver a Cursos
            </button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!course) return null;

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title={course.title}>
        <div className={styles.courseContainer}>
          {/* Header del Curso */}
          <div className={styles.courseHeader}>
            <div className="flex justify-between items-start mb-4">
              <button
                onClick={() => router.push("/courses")}
                className={styles.backButton}
              >
                ← Volver a Cursos
              </button>
              {canEdit() && (
                <button
                  onClick={() => setShowEditCourse(true)}
                  className={styles.editButton}
                >
                  ✏️ Editar Curso
                </button>
              )}
            </div>

            <div className={styles.courseInfo}>
              {/* Imagen del curso */}
              <div className={styles.courseImage}>{course.title.charAt(0)}</div>

              {/* Información del curso */}
              <div className={styles.courseDetails}>
                <h1>{course.title}</h1>
                <p>{course.description}</p>

                <div className={styles.courseStats}>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Nivel</div>
                    <div className={styles.statValue}>{course.level}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Duración</div>
                    <div className={styles.statValue}>
                      {course.duration_weeks} sem
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Estudiantes</div>
                    <div className={styles.statValue}>
                      {course.current_students}/{course.max_students}
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Progreso</div>
                    <div className={styles.statValue}>{weeks.length}/12</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Semanas del Curso */}
          <div className={styles.weeksSection}>
            <div className={styles.sectionHeader}>
              <h2>📅 Semanas del Curso</h2>
              {canEdit() && weeks.length < 12 && (
                <button
                  onClick={handleCreateWeek}
                  className={styles.createButton}
                >
                  ➕ Crear Semana
                </button>
              )}
            </div>

            {weeks.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📚</div>
                <h3>No hay semanas creadas</h3>
                <p>
                  {canEdit()
                    ? "Comienza creando la primera semana del curso"
                    : "El instructor aún no ha creado contenido para este curso"}
                </p>
                {canEdit() && (
                  <button
                    onClick={handleCreateWeek}
                    className={styles.createButton}
                  >
                    ➕ Crear Primera Semana
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.weeksGrid}>
                {weeks.map((week) => (
                  <div
                    key={week.id}
                    className={`${styles.weekCard} ${
                      week.is_locked && currentUser?.role === "student"
                        ? styles.locked
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className={styles.weekHeader}>
                          <span className={styles.weekBadge}>
                            SEMANA {week.week_number}
                          </span>
                          <h3 className={styles.weekTitle}>{week.title}</h3>
                          {week.is_locked &&
                            currentUser?.role === "student" && (
                              <span className={styles.lockedBadge}>
                                🔒 Bloqueada
                              </span>
                            )}
                        </div>

                        <p className={styles.weekDescription}>
                          {week.description}
                        </p>

                        {week.objectives && week.objectives.length > 0 && (
                          <div className={styles.objectivesList}>
                            <div className={styles.objectivesLabel}>
                              🎯 Objetivos:
                            </div>
                            <ul>
                              {week.objectives.slice(0, 2).map((obj, idx) => (
                                <li key={idx}>
                                  <span className="bullet">•</span>
                                  {obj}
                                </li>
                              ))}
                              {week.objectives.length > 2 && (
                                <li className={styles.moreObjectives}>
                                  +{week.objectives.length - 2} objetivos más...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className={styles.weekActions}>
                        {(!week.is_locked ||
                          currentUser?.role !== "student") && (
                          <button
                            onClick={() =>
                              router.push(
                                `/courses/${courseId}/week/${week.id}`
                              )
                            }
                            className={`${styles.actionButton} ${styles.primary}`}
                          >
                            {currentUser?.role === "student"
                              ? "📖 Entrar"
                              : "📚 Gestionar"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Barra de progreso */}
            {weeks.length > 0 && (
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>Progreso del Curso</span>
                  <span className={styles.progressText}>
                    {weeks.length}/12 semanas
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(weeks.length / 12) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Edición de Curso */}
        {showEditCourse && (
          <CourseEditModal
            course={course}
            onSave={handleUpdateCourse}
            onCancel={() => setShowEditCourse(false)}
          />
        )}
      </PageLayout>
    </AuthGuard>
  );
}

// Modal para editar curso
interface CourseEditModalProps {
  course: Course;
  onSave: (updates: Partial<Course>) => void;
  onCancel: () => void;
}

const CourseEditModal: React.FC<CourseEditModalProps> = ({
  course,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || "",
    level: course.level,
    max_students: course.max_students,
    duration_weeks: course.duration_weeks,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">✏️ Editar Curso</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Curso *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel
              </label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value as any })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo Estudiantes
              </label>
              <input
                type="number"
                value={formData.max_students}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_students: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
