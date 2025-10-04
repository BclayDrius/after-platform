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
      if (weekNumber > 4) {
        alert("No se pueden crear más de 4 semanas por módulo");
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

  const handleDeleteWeek = async (weekId: string, weekNumber: number) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar la Semana ${weekNumber}? Se eliminará todo su contenido.`
      )
    ) {
      return;
    }

    try {
      await roleService.deleteCourseWeek(weekId);
      await loadCourseData();
      alert("Semana eliminada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al eliminar la semana");
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
            <div className={styles.courseHeaderButtons}>
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
                    <div className={styles.statValue}>{weeks.length}/4</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Semanas del Curso */}
          <div className={styles.weeksSection}>
            <div className={styles.sectionHeader}>
              <h2>📅 Semanas del Curso</h2>
              {canEdit() && weeks.length < 4 && (
                <button
                  onClick={handleCreateWeek}
                  className={styles.createButton}
                >
                  ➕ Crear Semana
                </button>
              )}
            </div>

            {weeks.length >= 4 ? (
              <div className={styles.completeBadge}>
                ✅ Módulo completo: Has alcanzado el máximo de 4 semanas
              </div>
            ) : (
              canEdit() &&
              weeks.length > 0 && (
                <div className={styles.suggestionBadge}>
                  💡 Puedes agregar {4 - weeks.length} semanas más para
                  completar este módulo
                </div>
              )
            )}

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
                    {/* Botón X para eliminar semana */}
                    {canEdit() && (
                      <button
                        onClick={() =>
                          handleDeleteWeek(week.id, week.week_number)
                        }
                        className={styles.deleteButton}
                        title="Eliminar semana"
                      >
                        ✕
                      </button>
                    )}

                    <div className={styles.weekCardContent}>
                      <div className={styles.weekMainContent}>
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
                    {weeks.length}/4 semanas
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(weeks.length / 4) * 100}%` }}
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    }

    if (formData.max_students < 1 || formData.max_students > 100) {
      newErrors.max_students = "Debe ser entre 1 y 100 estudiantes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className={`${styles.modalOverlay} ${styles.courseEditModal}`}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3>✏️ Editar Curso</h3>
          <button
            onClick={onCancel}
            className={styles.closeButton}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Título del Curso <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`${styles.formInput} ${
                  errors.title ? styles.error : ""
                }`}
                placeholder="ej: Desarrollo Web Avanzado"
                required
              />
              {errors.title && (
                <div className={styles.formError}>{errors.title}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Descripción <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={styles.formTextarea}
                rows={4}
                placeholder="Describe de qué trata el curso, qué aprenderán los estudiantes..."
              />
              <div className={styles.formHint}>
                Una buena descripción ayuda a los estudiantes a entender el
                valor del curso
              </div>
            </div>

            <div className={`${styles.formGrid} ${styles.cols2}`}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Nivel del Curso <span className={styles.required}>*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value as any })
                  }
                  className={styles.formSelect}
                  required
                >
                  <option value="beginner">🟢 Principiante</option>
                  <option value="intermediate">🟡 Intermedio</option>
                  <option value="advanced">🔴 Avanzado</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Máximo Estudiantes <span className={styles.required}>*</span>
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
                  className={`${styles.formInput} ${
                    errors.max_students ? styles.error : ""
                  }`}
                  min="1"
                  max="100"
                  placeholder="25"
                  required
                />
                {errors.max_students && (
                  <div className={styles.formError}>{errors.max_students}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onCancel}
              className={`${styles.button} ${styles.secondary}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.primary}`}
            >
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
