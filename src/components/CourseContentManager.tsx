"use client";

import React, { useState, useEffect } from "react";
import {
  roleService,
  User,
  Course,
  CourseWeek,
  Lesson,
} from "@/services/roleService";
import styles from "./CourseContentManager.module.scss";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";

interface CourseContentManagerProps {
  currentUser: User;
  courseId: string;
  onBack: () => void;
}

const CourseContentManager: React.FC<CourseContentManagerProps> = ({
  currentUser,
  courseId,
  onBack,
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<CourseWeek | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "weeks" | "content">(
    "overview"
  );
  const [showWeekForm, setShowWeekForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingWeek, setEditingWeek] = useState<CourseWeek | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Estados para modales
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: "week" | "lesson" | "assignment";
    id: string;
    title: string;
  }>({ isOpen: false, type: "week", id: "", title: "" });

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, message: "", type: "success" });

  // Verificar permisos de edición
  const canEdit = () => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "teacher" && course?.creator_id === currentUser.id)
      return true;
    return false;
  };

  const isReadOnly = currentUser.role === "student";

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    if (selectedWeek) {
      loadWeekContent();
    }
  }, [selectedWeek]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, weeksData] = await Promise.all([
        roleService
          .getCourses()
          .then((courses) => courses.find((c) => c.id === courseId)),
        roleService.getCourseWeeks(courseId),
      ]);

      setCourse(courseData || null);
      setWeeks(weeksData);

      if (weeksData.length > 0 && !selectedWeek) {
        setSelectedWeek(weeksData[0]);
      }
    } catch (err) {
      setError("Error al cargar el curso");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekContent = async () => {
    if (!selectedWeek) return;

    try {
      const [lessonsData, assignmentsData] = await Promise.all([
        roleService.getWeekLessons(selectedWeek.id),
        roleService.getWeekAssignments(selectedWeek.id),
      ]);

      setLessons(lessonsData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error("Error loading week content:", err);
    }
  };

  const handleCreateWeek = async (weekData: any) => {
    try {
      await roleService.createCourseWeek(courseId, {
        ...weekData,
        course_id: courseId,
        objectives: weekData.objectives ? JSON.parse(weekData.objectives) : [],
        topics: weekData.topics ? JSON.parse(weekData.topics) : [],
      });

      await loadCourseData();
      setShowWeekForm(false);
      setToast({
        isOpen: true,
        message: "Semana creada exitosamente",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || "Error al crear la semana",
        type: "error",
      });
    }
  };

  const handleUpdateWeek = async (weekData: any) => {
    if (!editingWeek) return;

    try {
      await roleService.updateCourseWeek(editingWeek.id, {
        ...weekData,
        objectives: weekData.objectives ? JSON.parse(weekData.objectives) : [],
        topics: weekData.topics ? JSON.parse(weekData.topics) : [],
      });

      await loadCourseData();
      setEditingWeek(null);
      setToast({
        isOpen: true,
        message: "Semana actualizada exitosamente",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || "Error al actualizar la semana",
        type: "error",
      });
    }
  };

  const handleDeleteWeek = (weekId: string, weekTitle: string) => {
    setConfirmDelete({
      isOpen: true,
      type: "week",
      id: weekId,
      title: weekTitle,
    });
  };

  const confirmDeleteItem = async () => {
    try {
      if (confirmDelete.type === "week") {
        await roleService.deleteCourseWeek(confirmDelete.id);
        await loadCourseData();
        if (selectedWeek?.id === confirmDelete.id) {
          setSelectedWeek(weeks[0] || null);
        }
      } else if (confirmDelete.type === "lesson") {
        await roleService.deleteLesson(confirmDelete.id);
        await loadWeekContent();
      } else if (confirmDelete.type === "assignment") {
        await roleService.deleteAssignment(confirmDelete.id);
        await loadWeekContent();
      }

      setConfirmDelete({ isOpen: false, type: "week", id: "", title: "" });
      setToast({
        isOpen: true,
        message: `${
          confirmDelete.type === "week"
            ? "Semana"
            : confirmDelete.type === "lesson"
            ? "Lección"
            : "Tarea"
        } eliminada exitosamente`,
        type: "success",
      });
    } catch (err: any) {
      setToast({
        isOpen: true,
        message:
          err.message ||
          `Error al eliminar la ${
            confirmDelete.type === "week"
              ? "semana"
              : confirmDelete.type === "lesson"
              ? "lección"
              : "tarea"
          }`,
        type: "error",
      });
    }
  };

  const handleCreateLesson = async (lessonData: any) => {
    if (!selectedWeek) return;

    try {
      await roleService.createLesson(selectedWeek.id, lessonData);
      await loadWeekContent();
      setShowLessonForm(false);
      setToast({
        isOpen: true,
        message: "Lección creada exitosamente",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || "Error al crear la lección",
        type: "error",
      });
    }
  };

  const handleUpdateLesson = async (lessonData: any) => {
    if (!editingLesson) return;

    try {
      await roleService.updateLesson(editingLesson.id, lessonData);
      await loadWeekContent();
      setEditingLesson(null);
      setToast({
        isOpen: true,
        message: "Lección actualizada exitosamente",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || "Error al actualizar la lección",
        type: "error",
      });
    }
  };

  const handleDeleteLesson = (lessonId: string, lessonTitle: string) => {
    setConfirmDelete({
      isOpen: true,
      type: "lesson",
      id: lessonId,
      title: lessonTitle,
    });
  };

  const handleCreateAssignment = async (assignmentData: any) => {
    if (!selectedWeek) return;

    try {
      await roleService.createAssignment(selectedWeek.id, assignmentData);
      await loadWeekContent();
      setShowAssignmentForm(false);
      setToast({
        isOpen: true,
        message: "Tarea creada exitosamente",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || "Error al crear la tarea",
        type: "error",
      });
    }
  };

  const handleDeleteAssignment = (
    assignmentId: string,
    assignmentTitle: string
  ) => {
    setConfirmDelete({
      isOpen: true,
      type: "assignment",
      id: assignmentId,
      title: assignmentTitle,
    });
  };

  // Calcular total de lecciones
  const getTotalLessons = () => {
    return weeks.reduce((total, week) => {
      // Contar lecciones por semana (esto debería venir del backend)
      return total + (week.id === selectedWeek?.id ? lessons.length : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando contenido del curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Curso no encontrado</h2>
          <button onClick={onBack} className={styles.backButton}>
            ← Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={onBack} className={styles.backButton}>
            ← Volver a cursos
          </button>
          <h2 className={styles.title}>{course.title}</h2>
          <p className={styles.description}>{course.description}</p>
          {isReadOnly && (
            <div className={styles.readOnlyBadge}>👁️ Modo solo lectura</div>
          )}
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.metaItem}>
            Nivel: <span className={styles.metaValue}>{course.level}</span>
          </div>
          <div className={styles.metaItem}>
            Duración:{" "}
            <span className={styles.metaValue}>
              {course.duration_weeks} semanas
            </span>
          </div>
          {canEdit() && (
            <div className={styles.editPermissions}>✏️ Permisos de edición</div>
          )}
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Tabs */}
      <div className={styles.tabsContainer}>
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
              onClick={() => setActiveTab("weeks")}
              className={`${styles.tab} ${
                activeTab === "weeks" ? styles.active : ""
              }`}
            >
              📅 Semanas ({weeks.length}/12)
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`${styles.tab} ${
                activeTab === "content" ? styles.active : ""
              }`}
            >
              📚 Contenido
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className={styles.overviewTab}>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.blue}`}>
              <h3 className={styles.statTitle}>📅 Semanas</h3>
              <p className={styles.statValue}>{weeks.length}/12</p>
              <p className={styles.statLabel}>Semanas creadas</p>
            </div>
            <div className={`${styles.statCard} ${styles.green}`}>
              <h3 className={styles.statTitle}>📚 Lecciones</h3>
              <p className={styles.statValue}>{lessons.length}</p>
              <p className={styles.statLabel}>Total de lecciones</p>
            </div>
            <div className={`${styles.statCard} ${styles.purple}`}>
              <h3 className={styles.statTitle}>👥 Estudiantes</h3>
              <p className={styles.statValue}>
                {course.current_students}/{course.max_students}
              </p>
              <p className={styles.statLabel}>Inscritos</p>
            </div>
          </div>

          <div className={styles.progressCard}>
            <h3 className={styles.progressTitle}>📈 Progreso del Curso</h3>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(weeks.length / 12) * 100}%` }}
              ></div>
            </div>
            <p className={styles.progressText}>
              {weeks.length} de 12 semanas completadas (
              {Math.round((weeks.length / 12) * 100)}%)
            </p>
          </div>

          {canEdit() && weeks.length < 12 && (
            <div className={styles.suggestionCard}>
              <h4 className={styles.suggestionTitle}>💡 Sugerencia</h4>
              <p className={styles.suggestionText}>
                Puedes agregar {12 - weeks.length} semanas más para completar el
                curso.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Weeks Tab */}
      {activeTab === "weeks" && (
        <div className={styles.weeksTab}>
          <div className={styles.tabHeader}>
            <h3 className={styles.tabTitle}>📅 Gestión de Semanas</h3>
            {canEdit() && weeks.length < 12 && (
              <button
                onClick={() => setShowWeekForm(true)}
                className={styles.createButton}
              >
                <span>➕</span>
                <span>Agregar Semana</span>
              </button>
            )}
          </div>

          {weeks.length >= 12 && (
            <div className={styles.completeCourseAlert}>
              ✅ Curso completo: Has alcanzado el máximo de 12 semanas
            </div>
          )}

          <div className={styles.weeksGrid}>
            {weeks.map((week) => (
              <div key={week.id} className={styles.weekCard}>
                <div className={styles.weekCardContent}>
                  <div className={styles.weekCardMain}>
                    <div className={styles.weekHeader}>
                      <span className={styles.weekBadge}>
                        SEMANA {week.week_number}
                      </span>
                      <h4 className={styles.weekTitle}>{week.title}</h4>
                    </div>
                    <p className={styles.weekDescription}>{week.description}</p>

                    {week.objectives && week.objectives.length > 0 && (
                      <div className={styles.weekObjectives}>
                        <span className={styles.objectivesLabel}>
                          🎯 Objetivos:
                        </span>
                        <ul className={styles.objectivesList}>
                          {week.objectives.map((obj, idx) => (
                            <li key={idx} className={styles.objectiveItem}>
                              <span className={styles.bullet}>•</span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {week.topics && week.topics.length > 0 && (
                      <div className={styles.weekTopics}>
                        <span className={styles.topicsLabel}>📋 Temas:</span>
                        <div className={styles.topicsList}>
                          {week.topics.map((topic, idx) => (
                            <span key={idx} className={styles.topicTag}>
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.weekMeta}>
                      <span
                        className={`${styles.statusBadge} ${
                          week.is_locked ? styles.locked : styles.unlocked
                        }`}
                      >
                        {week.is_locked ? "🔒 Bloqueada" : "🔓 Disponible"}
                      </span>
                      {week.unlock_date && (
                        <span className={styles.metaText}>
                          📅 Disponible desde:{" "}
                          {new Date(week.unlock_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className={styles.metaText}>
                        📚 {lessons.length} lecciones
                      </span>
                    </div>
                  </div>

                  {canEdit() && (
                    <div className={styles.weekActions}>
                      <button
                        onClick={() => setEditingWeek(week)}
                        className={styles.editButton}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteWeek(week.id, week.title)}
                        className={styles.deleteButton}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {weeks.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <h3 className={styles.emptyTitle}>No hay semanas creadas</h3>
              <p className={styles.emptyText}>
                Comienza creando la primera semana de tu curso
              </p>
              {canEdit() && (
                <button
                  onClick={() => setShowWeekForm(true)}
                  className={styles.createButton}
                >
                  ➕ Crear Primera Semana
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className={styles.contentTab}>
          {weeks.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📚</div>
              <h3 className={styles.emptyTitle}>Sin contenido disponible</h3>
              <p className={styles.emptyText}>
                Primero debes crear al menos una semana para agregar contenido
              </p>
            </div>
          ) : (
            <div className={styles.contentGrid}>
              {/* Week Selector */}
              <div className={styles.weekSelector}>
                <h3 className={styles.selectorTitle}>📅 Seleccionar Semana</h3>
                <div className={styles.selectorList}>
                  {weeks.map((week) => (
                    <button
                      key={week.id}
                      onClick={() => setSelectedWeek(week)}
                      className={`${styles.selectorItem} ${
                        selectedWeek?.id === week.id ? styles.selected : ""
                      }`}
                    >
                      <div className={styles.selectorWeek}>
                        Semana {week.week_number}
                      </div>
                      <div className={styles.selectorTitle}>{week.title}</div>
                      <div className={styles.selectorMeta}>
                        📚 {lessons.length} lecciones
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className={styles.contentArea}>
                {selectedWeek ? (
                  <div>
                    <div className={styles.contentHeader}>
                      <div className={styles.contentInfo}>
                        <h3 className={styles.contentTitle}>
                          📚 Semana {selectedWeek.week_number}:{" "}
                          {selectedWeek.title}
                        </h3>
                        <p className={styles.contentDescription}>
                          {selectedWeek.description}
                        </p>
                      </div>
                      {canEdit() && (
                        <div className={styles.contentActions}>
                          <button
                            onClick={() => setShowLessonForm(true)}
                            className={`${styles.actionButton} ${styles.green}`}
                          >
                            <span>➕</span>
                            <span>Lección</span>
                          </button>
                          <button
                            onClick={() => setShowAssignmentForm(true)}
                            className={`${styles.actionButton} ${styles.purple}`}
                          >
                            <span>➕</span>
                            <span>Tarea</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Lessons */}
                    <div className={styles.lessonsSection}>
                      <h4 className={styles.sectionTitle}>
                        <span>📖</span>
                        Lecciones ({lessons.length})
                      </h4>
                      {lessons.length > 0 ? (
                        <div className={styles.itemsList}>
                          {lessons.map((lesson) => (
                            <div key={lesson.id} className={styles.itemCard}>
                              <div className={styles.itemContent}>
                                <div className={styles.itemMain}>
                                  <div className={styles.itemHeader}>
                                    <span className={styles.orderBadge}>
                                      #{lesson.order_index}
                                    </span>
                                    <h5 className={styles.itemTitle}>
                                      {lesson.title}
                                    </h5>
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
                                  </div>
                                  <p className={styles.itemDescription}>
                                    {lesson.description}
                                  </p>
                                  <div className={styles.itemMeta}>
                                    <span>
                                      ⏱️ {lesson.duration_minutes} min
                                    </span>
                                    <span>🏆 {lesson.points_value} puntos</span>
                                    {lesson.is_required && (
                                      <span className={styles.requiredBadge}>
                                        ⚠️ Obligatoria
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {canEdit() && (
                                  <div className={styles.itemActions}>
                                    <button
                                      onClick={() => setEditingLesson(lesson)}
                                      className={styles.editButton}
                                    >
                                      ✏️ Editar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteLesson(
                                          lesson.id,
                                          lesson.title
                                        )
                                      }
                                      className={styles.deleteButton}
                                    >
                                      🗑️ Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.emptyContent}>
                          <div className={styles.emptyIcon}>📖</div>
                          <p className={styles.emptyText}>
                            No hay lecciones en esta semana
                          </p>
                          {canEdit() && (
                            <button
                              onClick={() => setShowLessonForm(true)}
                              className={styles.createButton}
                            >
                              ➕ Crear la primera lección
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Assignments */}
                    <div className={styles.assignmentsSection}>
                      <h4 className={styles.sectionTitle}>
                        <span>📝</span>
                        Tareas ({assignments.length})
                      </h4>
                      {assignments.length > 0 ? (
                        <div className={styles.itemsList}>
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className={styles.itemCard}
                            >
                              <div className={styles.itemContent}>
                                <div className={styles.itemMain}>
                                  <h5 className={styles.itemTitle}>
                                    {assignment.title}
                                  </h5>
                                  <p className={styles.itemDescription}>
                                    {assignment.description}
                                  </p>
                                  <div className={styles.itemMeta}>
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
                                    {assignment.is_required && (
                                      <span className={styles.requiredBadge}>
                                        ⚠️ Obligatoria
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {canEdit() && (
                                  <div className={styles.itemActions}>
                                    <button className={styles.editButton}>
                                      ✏️ Editar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteAssignment(
                                          assignment.id,
                                          assignment.title
                                        )
                                      }
                                      className={styles.deleteButton}
                                    >
                                      🗑️ Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.emptyContent}>
                          <div className={styles.emptyIcon}>📝</div>
                          <p className={styles.emptyText}>
                            No hay tareas en esta semana
                          </p>
                          {canEdit() && (
                            <button
                              onClick={() => setShowAssignmentForm(true)}
                              className={styles.createButton}
                            >
                              ➕ Crear la primera tarea
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👈</div>
                    <h3 className={styles.emptyTitle}>Selecciona una semana</h3>
                    <p className={styles.emptyText}>
                      Elige una semana de la lista para ver y gestionar su
                      contenido
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={`Eliminar ${
          confirmDelete.type === "week"
            ? "Semana"
            : confirmDelete.type === "lesson"
            ? "Lección"
            : "Tarea"
        }`}
        message={`¿Estás seguro de que quieres eliminar "${
          confirmDelete.title
        }"? ${
          confirmDelete.type === "week"
            ? "Se eliminará todo su contenido incluyendo lecciones y tareas."
            : "Esta acción no se puede deshacer."
        }`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDeleteItem}
        onCancel={() =>
          setConfirmDelete({ isOpen: false, type: "week", id: "", title: "" })
        }
      />

      {/* Toast de Notificaciones */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast({ isOpen: false, message: "", type: "success" })
        }
      />
    </div>
  );
};

export default CourseContentManager;
