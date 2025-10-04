"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import {
  roleService,
  Course,
  CourseWeek,
  Lesson,
  User,
} from "@/services/roleService";
import styles from "./week.module.scss";

export default function WeekPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const weekId = params.weekId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [week, setWeek] = useState<CourseWeek | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "lessons" | "assignments"
  >("overview");
  const [showEditWeek, setShowEditWeek] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  const canEdit = () => {
    if (!currentUser || !course) return false;
    return (
      currentUser.role === "admin" ||
      (currentUser.role === "teacher" && course.creator_id === currentUser.id)
    );
  };

  useEffect(() => {
    loadWeekData();
  }, [weekId]);

  const loadWeekData = async () => {
    try {
      setLoading(true);

      const user = await roleService.getCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setError("Usuario no autenticado");
        return;
      }

      // Cargar datos del curso y semana
      const [courseData, weekData, lessonsData, assignmentsData] =
        await Promise.all([
          roleService
            .getCourses()
            .then((courses) => courses.find((c) => c.id === courseId)),
          roleService
            .getCourseWeeks(courseId)
            .then((weeks) => weeks.find((w) => w.id === weekId)),
          roleService.getWeekLessons(weekId),
          roleService.getWeekAssignments(weekId),
        ]);

      if (!courseData) {
        setError("Curso no encontrado");
        return;
      }

      if (!weekData) {
        setError("Semana no encontrada");
        return;
      }

      setCourse(courseData);
      setWeek(weekData);
      setLessons(lessonsData);
      setAssignments(assignmentsData);
    } catch (err: any) {
      console.error("Error loading week:", err);
      setError(err.message || "Error al cargar la semana");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeek = async (updates: Partial<CourseWeek>) => {
    if (!week) return;

    try {
      await roleService.updateCourseWeek(week.id, updates);
      setWeek({ ...week, ...updates });
      setShowEditWeek(false);
      alert("Semana actualizada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al actualizar la semana");
    }
  };

  const handleCreateLesson = async (lessonData: any) => {
    try {
      await roleService.createLesson(weekId, lessonData);
      await loadWeekData();
      setShowCreateLesson(false);
      alert("Lección creada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al crear la lección");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta lección?")) return;

    try {
      await roleService.deleteLesson(lessonId);
      await loadWeekData();
      alert("Lección eliminada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al eliminar la lección");
    }
  };

  const handleCreateAssignment = async (assignmentData: any) => {
    try {
      await roleService.createAssignment(weekId, assignmentData);
      await loadWeekData();
      setShowCreateAssignment(false);
      alert("Tarea creada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al crear la tarea");
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Cargando...">
          <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
              <div className={styles.loadingSpinner}></div>
              <p>Cargando semana...</p>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (error || !course || !week) {
    return (
      <AuthGuard>
        <Sidebar />
        <PageLayout title="Error">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.errorTitle}>Error</h2>
            <p className={styles.errorMessage}>
              {error || "Contenido no encontrado"}
            </p>
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className={styles.errorButton}
            >
              Volver al Curso
            </button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title={`${course.title} - Semana ${week.week_number}`}>
        <div className={styles.weekContainer}>
          {/* Header de la Semana */}
          <div className={styles.weekHeader}>
            <div className={styles.headerActions}>
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className={styles.backButton}
              >
                ← Volver al Curso
              </button>
              {canEdit() && (
                <button
                  onClick={() => setShowEditWeek(true)}
                  className={styles.editButton}
                >
                  ✏️ Editar Semana
                </button>
              )}
            </div>

            <div className={styles.weekInfo}>
              <div className={styles.weekBadge}>SEMANA {week.week_number}</div>
              <div>
                <h1 className={styles.weekTitle}>{week.title}</h1>
                <p className={styles.weekDescription}>{week.description}</p>
              </div>
            </div>

            {/* Objetivos y Temas */}
            <div className={styles.objectivesGrid}>
              {week.objectives && week.objectives.length > 0 && (
                <div className={styles.objectivesCard}>
                  <h3>🎯 Objetivos de Aprendizaje</h3>
                  <ul>
                    {week.objectives.map((objective, idx) => (
                      <li key={idx}>
                        <span className="bullet">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {week.topics && week.topics.length > 0 && (
                <div
                  className={`${styles.objectivesCard} ${styles.topicsCard}`}
                >
                  <h3>📋 Temas a Cubrir</h3>
                  <div className={styles.topicsList}>
                    {week.topics.map((topic, idx) => (
                      <span key={idx} className={styles.topicTag}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs de Contenido */}
          <div className={styles.contentSection}>
            <div className={styles.tabsHeader}>
              <nav className={styles.tabsNav}>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`${styles.tab} ${
                    activeTab === "overview" ? styles.active : ""
                  }`}
                >
                  📊 Resumen
                </button>
                <button
                  onClick={() => setActiveTab("lessons")}
                  className={`${styles.tab} ${
                    activeTab === "lessons" ? styles.active : ""
                  }`}
                >
                  📖 Lecciones ({lessons.length})
                </button>
                <button
                  onClick={() => setActiveTab("assignments")}
                  className={`${styles.tab} ${
                    activeTab === "assignments" ? styles.active : ""
                  }`}
                >
                  📝 Tareas ({assignments.length})
                </button>
              </nav>
            </div>

            <div className={styles.tabContent}>
              {/* Tab: Resumen */}
              {activeTab === "overview" && (
                <div>
                  <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.blue}`}>
                      <div className={styles.statValue}>{lessons.length}</div>
                      <div className={styles.statLabel}>Lecciones</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.purple}`}>
                      <div className={styles.statValue}>
                        {assignments.length}
                      </div>
                      <div className={styles.statLabel}>Tareas</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.green}`}>
                      <div className={styles.statValue}>
                        {lessons.reduce(
                          (total, lesson) => total + lesson.duration_minutes,
                          0
                        )}
                      </div>
                      <div className={styles.statLabel}>Minutos Total</div>
                    </div>
                  </div>

                  {/* Progreso de la semana */}
                  <div className={styles.progressCard}>
                    <h3>📈 Contenido de la Semana</h3>
                    <div>
                      {lessons.length === 0 && assignments.length === 0 ? (
                        <p className={styles.emptyContentText}>
                          {canEdit()
                            ? "Aún no hay contenido. Comienza agregando lecciones o tareas."
                            : "El instructor aún no ha agregado contenido a esta semana."}
                        </p>
                      ) : (
                        <>
                          {lessons.length > 0 && (
                            <div className={styles.progressItem}>
                              <span className={styles.progressLabel}>
                                📖 Lecciones completadas
                              </span>
                              <span className={styles.progressValue}>
                                0/{lessons.length}
                              </span>
                            </div>
                          )}
                          {assignments.length > 0 && (
                            <div className={styles.progressItem}>
                              <span className={styles.progressLabel}>
                                📝 Tareas entregadas
                              </span>
                              <span className={styles.progressValue}>
                                0/{assignments.length}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Lecciones */}
              {activeTab === "lessons" && (
                <div>
                  <div className={styles.tabHeader}>
                    <h3>📖 Lecciones</h3>
                    {canEdit() && (
                      <button
                        onClick={() => setShowCreateLesson(true)}
                        className={`${styles.createButton}`}
                      >
                        ➕ Crear Lección
                      </button>
                    )}
                  </div>

                  {lessons.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📖</div>
                      <h3>No hay lecciones</h3>
                      <p>
                        {canEdit()
                          ? "Comienza creando la primera lección de esta semana"
                          : "El instructor aún no ha creado lecciones para esta semana"}
                      </p>
                      {canEdit() && (
                        <button
                          onClick={() => setShowCreateLesson(true)}
                          className={styles.createButton}
                        >
                          ➕ Crear Primera Lección
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={styles.contentGrid}>
                      {lessons.map((lesson) => (
                        <div key={lesson.id} className={styles.contentCard}>
                          <div className={styles.contentCardLayout}>
                            <div className={styles.contentCardMain}>
                              <div className={styles.contentHeader}>
                                <span className={styles.orderBadge}>
                                  #{lesson.order_index}
                                </span>
                                <h4 className={styles.contentTitle}>
                                  {lesson.title}
                                </h4>
                                <span
                                  className={`${styles.typeBadge} ${
                                    styles[lesson.type]
                                  }`}
                                >
                                  {lesson.type === "video"
                                    ? "🎥"
                                    : lesson.type === "reading"
                                    ? "📖"
                                    : lesson.type === "exercise"
                                    ? "💻"
                                    : lesson.type === "quiz"
                                    ? "❓"
                                    : "📄"}{" "}
                                  {lesson.type}
                                </span>
                                {lesson.is_required && (
                                  <span className={styles.requiredBadge}>
                                    ⚠️ Obligatoria
                                  </span>
                                )}
                              </div>

                              <p className={styles.contentDescription}>
                                {lesson.description}
                              </p>

                              <div className={styles.contentMeta}>
                                <span>⏱️ {lesson.duration_minutes} min</span>
                                <span>🏆 {lesson.points_value} puntos</span>
                              </div>

                              {lesson.content_text && (
                                <div className={styles.contentPreview}>
                                  <p>
                                    {lesson.content_text.substring(0, 200)}...
                                  </p>
                                </div>
                              )}

                              {lesson.content_url && (
                                <a
                                  href={lesson.content_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.contentLink}
                                >
                                  🔗 Ver recurso externo
                                </a>
                              )}
                            </div>

                            <div className={styles.contentActions}>
                              {currentUser?.role === "student" ? (
                                <button
                                  className={`${styles.actionButton} ${styles.primary}`}
                                >
                                  ▶️ Comenzar
                                </button>
                              ) : (
                                canEdit() && (
                                  <>
                                    <button
                                      className={`${styles.actionButton} ${styles.secondary}`}
                                    >
                                      ✏️ Editar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteLesson(lesson.id)
                                      }
                                      className={`${styles.actionButton} ${styles.danger}`}
                                    >
                                      🗑️ Eliminar
                                    </button>
                                  </>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Tareas */}
              {activeTab === "assignments" && (
                <div>
                  <div className={styles.tabHeader}>
                    <h3>📝 Tareas</h3>
                    {canEdit() && (
                      <button
                        onClick={() => setShowCreateAssignment(true)}
                        className={`${styles.createButton} ${styles.purple}`}
                      >
                        ➕ Crear Tarea
                      </button>
                    )}
                  </div>

                  {assignments.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📝</div>
                      <h3>No hay tareas</h3>
                      <p>
                        {canEdit()
                          ? "Comienza creando la primera tarea de esta semana"
                          : "El instructor aún no ha creado tareas para esta semana"}
                      </p>
                      {canEdit() && (
                        <button
                          onClick={() => setShowCreateAssignment(true)}
                          className={styles.createAssignmentButton}
                        >
                          ➕ Crear Primera Tarea
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={styles.assignmentsList}>
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className={styles.assignmentCard}
                        >
                          <div className={styles.assignmentCardLayout}>
                            <div className={styles.assignmentCardMain}>
                              <div className={styles.assignmentHeader}>
                                <h4 className={styles.assignmentTitle}>
                                  {assignment.title}
                                </h4>
                                {assignment.is_required && (
                                  <span className={styles.requiredBadge}>
                                    ⚠️ Obligatoria
                                  </span>
                                )}
                              </div>

                              <p className={styles.assignmentDescription}>
                                {assignment.description}
                              </p>

                              <div className={styles.assignmentMeta}>
                                <span>
                                  🏆 {assignment.max_points} puntos máximo
                                </span>
                                {assignment.due_date && (
                                  <span>
                                    📅 Vence:{" "}
                                    {new Date(
                                      assignment.due_date
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              {assignment.instructions && (
                                <div className={styles.instructionsBox}>
                                  <h5 className={styles.instructionsTitle}>
                                    📋 Instrucciones:
                                  </h5>
                                  <p className={styles.instructionsText}>
                                    {assignment.instructions.substring(0, 300)}
                                    ...
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className={styles.assignmentActions}>
                              {currentUser?.role === "student" ? (
                                <button className={styles.submitButton}>
                                  📤 Entregar
                                </button>
                              ) : (
                                canEdit() && (
                                  <>
                                    <button className={styles.editButton}>
                                      ✏️ Editar
                                    </button>
                                    <button className={styles.deleteButton}>
                                      🗑️ Eliminar
                                    </button>
                                  </>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modales */}
        {showEditWeek && (
          <WeekEditModal
            week={week}
            onSave={handleUpdateWeek}
            onCancel={() => setShowEditWeek(false)}
          />
        )}

        {showCreateLesson && (
          <LessonCreateModal
            onSave={handleCreateLesson}
            onCancel={() => setShowCreateLesson(false)}
            nextOrderIndex={lessons.length + 1}
          />
        )}

        {showCreateAssignment && (
          <AssignmentCreateModal
            onSave={handleCreateAssignment}
            onCancel={() => setShowCreateAssignment(false)}
          />
        )}
      </PageLayout>
    </AuthGuard>
  );
}

// Modal para editar semana
interface WeekEditModalProps {
  week: CourseWeek;
  onSave: (updates: Partial<CourseWeek>) => void;
  onCancel: () => void;
}

const WeekEditModal: React.FC<WeekEditModalProps> = ({
  week,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: week.title,
    description: week.description || "",
    objectives: JSON.stringify(week.objectives || [], null, 2),
    topics: JSON.stringify(week.topics || [], null, 2),
    is_locked: week.is_locked,
    unlock_date: week.unlock_date
      ? new Date(week.unlock_date).toISOString().slice(0, 16)
      : "",
    estimated_hours: (week as any).estimated_hours || 4,
    max_points: (week as any).max_points || 100,
    instructor_notes: (week as any).instructor_notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates = {
        ...formData,
        objectives: JSON.parse(formData.objectives),
        topics: JSON.parse(formData.topics),
      };
      onSave(updates);
    } catch (err) {
      // Mostrar error en el formulario en lugar de alert
      console.error("Error en el formato JSON:", err);
      return;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>
          ✏️ Editar Semana {week.week_number}
        </h3>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Información Básica */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>📝 Título de la Semana *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={styles.formInput}
              placeholder="Ej: Introducción y Fundamentos"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>📄 Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={styles.formInput}
              rows={3}
              placeholder="Describe brevemente el contenido y propósito de esta semana..."
            />
          </div>

          {/* Configuración de Estado */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>🔐 Estado de Acceso</label>
              <select
                value={formData.is_locked ? "locked" : "unlocked"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_locked: e.target.value === "locked",
                  })
                }
                className={styles.formSelect}
              >
                <option value="unlocked">🔓 Disponible</option>
                <option value="locked">🔒 Bloqueada</option>
              </select>
              <div className={styles.helpText}>
                Las semanas bloqueadas no son accesibles para los estudiantes
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>📅 Fecha de Desbloqueo</label>
              <input
                type="datetime-local"
                value={formData.unlock_date}
                onChange={(e) =>
                  setFormData({ ...formData, unlock_date: e.target.value })
                }
                className={styles.formInput}
              />
              <div className={styles.helpText}>
                Fecha automática de desbloqueo (opcional)
              </div>
            </div>
          </div>

          {/* Sección Avanzada */}
          <div className={styles.advancedSection}>
            <div className={styles.sectionTitle}>⚙️ Configuración Avanzada</div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                🎯 Objetivos de Aprendizaje
              </label>
              <textarea
                value={formData.objectives}
                onChange={(e) =>
                  setFormData({ ...formData, objectives: e.target.value })
                }
                className={styles.formTextarea}
                rows={4}
                placeholder='["Comprender los conceptos básicos", "Aplicar metodologías", "Desarrollar habilidades prácticas"]'
              />
              <div className={styles.helpText}>
                Formato JSON: Array de strings con los objetivos de aprendizaje
              </div>
              {formData.objectives && (
                <div className={styles.jsonPreview}>
                  Vista previa: {formData.objectives}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>📋 Temas a Cubrir</label>
              <textarea
                value={formData.topics}
                onChange={(e) =>
                  setFormData({ ...formData, topics: e.target.value })
                }
                className={styles.formTextarea}
                rows={4}
                placeholder='["Introducción", "Conceptos fundamentales", "Ejercicios prácticos", "Evaluación"]'
              />
              <div className={styles.helpText}>
                Formato JSON: Array de strings con los temas principales
              </div>
              {formData.topics && (
                <div className={styles.jsonPreview}>
                  Vista previa: {formData.topics}
                </div>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  ⏱️ Duración Estimada (horas)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.estimated_hours || 4}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_hours: parseInt(e.target.value),
                    })
                  }
                  className={styles.formInput}
                  placeholder="4"
                />
                <div className={styles.helpText}>
                  Tiempo estimado de estudio para completar la semana
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>🏆 Puntos Máximos</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.max_points || 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_points: parseInt(e.target.value),
                    })
                  }
                  className={styles.formInput}
                  placeholder="100"
                />
                <div className={styles.helpText}>
                  Puntos máximos que se pueden obtener en esta semana
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                📝 Notas del Instructor
              </label>
              <textarea
                value={formData.instructor_notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, instructor_notes: e.target.value })
                }
                className={styles.formInput}
                rows={3}
                placeholder="Notas privadas para el instructor sobre esta semana..."
              />
              <div className={styles.helpText}>
                Notas privadas visibles solo para instructores
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              ❌ Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para crear lección
interface LessonCreateModalProps {
  onSave: (lessonData: any) => void;
  onCancel: () => void;
  nextOrderIndex: number;
}

const LessonCreateModal: React.FC<LessonCreateModalProps> = ({
  onSave,
  onCancel,
  nextOrderIndex,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "reading",
    duration_minutes: 30,
    order_index: nextOrderIndex,
    points_value: 10,
    is_required: true,
    content_url: "",
    content_text: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const lessonTypes = [
    { value: "video", label: "🎥 Video" },
    { value: "reading", label: "📖 Lectura" },
    { value: "exercise", label: "💻 Ejercicio" },
    { value: "quiz", label: "❓ Quiz" },
    { value: "assignment", label: "📝 Tarea" },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>➕ Crear Nueva Lección</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Lección *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {lessonTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden *
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_index: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Lección *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              placeholder="ej: Introducción a Variables"
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
              rows={3}
              placeholder="Descripción de lo que se aprenderá"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⏱️ Duración (minutos) *
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Puntos *
              </label>
              <input
                type="number"
                value={formData.points_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points_value: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) =>
                  setFormData({ ...formData, is_required: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                ⚠️ Lección obligatoria
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔗 URL del Contenido (opcional)
            </label>
            <input
              type="url"
              value={formData.content_url}
              onChange={(e) =>
                setFormData({ ...formData, content_url: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://ejemplo.com/video-o-recurso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 Contenido de Texto (opcional)
            </label>
            <textarea
              value={formData.content_text}
              onChange={(e) =>
                setFormData({ ...formData, content_text: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={6}
              placeholder="Contenido textual de la lección, instrucciones, etc."
            />
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
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ➕ Crear Lección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para crear tarea
interface AssignmentCreateModalProps {
  onSave: (assignmentData: any) => void;
  onCancel: () => void;
}

const AssignmentCreateModal: React.FC<AssignmentCreateModalProps> = ({
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    due_date: "",
    max_points: 100,
    submission_type: "text",
    is_required: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const submissionTypes = [
    { value: "text", label: "📝 Texto" },
    { value: "file", label: "📎 Archivo" },
    { value: "url", label: "🔗 URL" },
    { value: "both", label: "📝📎 Texto y Archivo" },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">➕ Crear Nueva Tarea</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Tarea *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              placeholder="ej: Proyecto Final - Aplicación Web"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Breve
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={2}
              placeholder="Descripción corta de la tarea"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Instrucciones Detalladas
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={6}
              placeholder="Instrucciones paso a paso, criterios de evaluación, recursos necesarios, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Fecha de Entrega
              </label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Puntos Máximos *
              </label>
              <input
                type="number"
                value={formData.max_points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_points: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Entrega
            </label>
            <select
              value={formData.submission_type}
              onChange={(e) =>
                setFormData({ ...formData, submission_type: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {submissionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) =>
                  setFormData({ ...formData, is_required: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                ⚠️ Tarea obligatoria
              </span>
            </label>
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
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              ➕ Crear Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
