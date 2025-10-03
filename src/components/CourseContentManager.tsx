"use client";

import React, { useState, useEffect } from "react";
import {
  roleService,
  User,
  Course,
  CourseWeek,
  Lesson,
} from "@/services/roleService";

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
      alert("Semana creada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al crear la semana");
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
      alert("Semana actualizada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al actualizar la semana");
    }
  };

  const handleDeleteWeek = async (weekId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta semana? Se eliminará todo su contenido."
      )
    ) {
      return;
    }

    try {
      await roleService.deleteCourseWeek(weekId);
      await loadCourseData();
      if (selectedWeek?.id === weekId) {
        setSelectedWeek(weeks[0] || null);
      }
      alert("Semana eliminada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al eliminar la semana");
    }
  };

  const handleCreateLesson = async (lessonData: any) => {
    if (!selectedWeek) return;

    try {
      await roleService.createLesson(selectedWeek.id, lessonData);
      await loadWeekContent();
      setShowLessonForm(false);
      alert("Lección creada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al crear la lección");
    }
  };

  const handleUpdateLesson = async (lessonData: any) => {
    if (!editingLesson) return;

    try {
      await roleService.updateLesson(editingLesson.id, lessonData);
      await loadWeekContent();
      setEditingLesson(null);
      alert("Lección actualizada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al actualizar la lección");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta lección?")) {
      return;
    }

    try {
      await roleService.deleteLesson(lessonId);
      await loadWeekContent();
      alert("Lección eliminada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al eliminar la lección");
    }
  };

  const handleCreateAssignment = async (assignmentData: any) => {
    if (!selectedWeek) return;

    try {
      await roleService.createAssignment(selectedWeek.id, assignmentData);
      await loadWeekContent();
      setShowAssignmentForm(false);
      alert("Tarea creada exitosamente");
    } catch (err: any) {
      alert(err.message || "Error al crear la tarea");
    }
  };

  if (loading) {
    return <div className="p-6">Cargando contenido del curso...</div>;
  }

  if (!course) {
    return <div className="p-6 text-red-600">Curso no encontrado</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Volver a cursos
          </button>
          <h2 className="text-2xl font-bold">{course.title}</h2>
          <p className="text-gray-600">{course.description}</p>
          {isReadOnly && (
            <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
              👁️ Modo solo lectura
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Nivel:{" "}
            <span className="font-medium capitalize">{course.level}</span>
          </div>
          <div className="text-sm text-gray-500">
            Duración:{" "}
            <span className="font-medium">{course.duration_weeks} semanas</span>
          </div>
          {canEdit() && (
            <div className="text-xs text-green-600 mt-1">
              ✏️ Permisos de edición
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => setActiveTab("weeks")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "weeks"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📅 Semanas ({weeks.length}/12)
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "content"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📚 Contenido
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">📅 Semanas</h3>
              <p className="text-2xl font-bold text-blue-600">
                {weeks.length}/12
              </p>
              <p className="text-sm text-blue-700">Semanas creadas</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">📚 Lecciones</h3>
              <p className="text-2xl font-bold text-green-600">
                {weeks.reduce(
                  (total, week) => total + (week.total_lessons || 0),
                  0
                )}
              </p>
              <p className="text-sm text-green-700">Total de lecciones</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">👥 Estudiantes</h3>
              <p className="text-2xl font-bold text-purple-600">
                {course.current_students}/{course.max_students}
              </p>
              <p className="text-sm text-purple-700">Inscritos</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📈 Progreso del Curso</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(weeks.length / 12) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {weeks.length} de 12 semanas completadas (
              {Math.round((weeks.length / 12) * 100)}%)
            </p>
          </div>

          {canEdit() && weeks.length < 12 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800">💡 Sugerencia</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Puedes agregar {12 - weeks.length} semanas más para completar el
                curso.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Weeks Tab */}
      {activeTab === "weeks" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">📅 Gestión de Semanas</h3>
            {canEdit() && weeks.length < 12 && (
              <button
                onClick={() => setShowWeekForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Agregar Semana</span>
              </button>
            )}
          </div>

          {weeks.length >= 12 && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
              ✅ Curso completo: Has alcanzado el máximo de 12 semanas
            </div>
          )}

          <div className="grid gap-4">
            {weeks.map((week) => (
              <div
                key={week.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                        SEMANA {week.week_number}
                      </span>
                      <h4 className="font-semibold text-lg">{week.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {week.description}
                    </p>

                    {week.objectives && week.objectives.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          🎯 Objetivos:
                        </span>
                        <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                          {week.objectives.map((obj, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {week.topics && week.topics.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          📋 Temas:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {week.topics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs">
                      <span
                        className={`px-2 py-1 rounded font-medium ${
                          week.is_locked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {week.is_locked ? "🔒 Bloqueada" : "🔓 Disponible"}
                      </span>
                      {week.unlock_date && (
                        <span className="text-gray-500">
                          📅 Disponible desde:{" "}
                          {new Date(week.unlock_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-gray-500">
                        📚 {week.total_lessons || 0} lecciones
                      </span>
                    </div>
                  </div>

                  {canEdit() && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setEditingWeek(week)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteWeek(week.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
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
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-medium mb-2">
                No hay semanas creadas
              </h3>
              <p className="text-sm mb-4">
                Comienza creando la primera semana de tu curso
              </p>
              {canEdit() && (
                <button
                  onClick={() => setShowWeekForm(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
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
        <div>
          {weeks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-medium mb-2">
                Sin contenido disponible
              </h3>
              <p className="text-sm">
                Primero debes crear al menos una semana para agregar contenido
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Week Selector */}
              <div className="lg:col-span-1">
                <h3 className="font-semibold mb-3">📅 Seleccionar Semana</h3>
                <div className="space-y-2">
                  {weeks.map((week) => (
                    <button
                      key={week.id}
                      onClick={() => setSelectedWeek(week)}
                      className={`w-full text-left p-3 rounded border transition-all ${
                        selectedWeek?.id === week.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">
                        Semana {week.week_number}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {week.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        📚 {week.total_lessons || 0} lecciones
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                {selectedWeek ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-semibold text-lg">
                          📚 Semana {selectedWeek.week_number}:{" "}
                          {selectedWeek.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedWeek.description}
                        </p>
                      </div>
                      {canEdit() && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowLessonForm(true)}
                            className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 flex items-center space-x-1"
                          >
                            <span>➕</span>
                            <span>Lección</span>
                          </button>
                          <button
                            onClick={() => setShowAssignmentForm(true)}
                            className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600 flex items-center space-x-1"
                          >
                            <span>➕</span>
                            <span>Tarea</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Lessons */}
                    <div className="mb-8">
                      <h4 className="font-medium mb-4 flex items-center">
                        <span className="mr-2">📖</span>
                        Lecciones ({lessons.length})
                      </h4>
                      {lessons.length > 0 ? (
                        <div className="space-y-3">
                          {lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                                      #{lesson.order_index}
                                    </span>
                                    <h5 className="font-medium">
                                      {lesson.title}
                                    </h5>
                                    <span
                                      className={`text-xs px-2 py-1 rounded font-medium ${
                                        lesson.type === "video"
                                          ? "bg-red-100 text-red-800"
                                          : lesson.type === "reading"
                                          ? "bg-blue-100 text-blue-800"
                                          : lesson.type === "exercise"
                                          ? "bg-green-100 text-green-800"
                                          : lesson.type === "quiz"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
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
                                  <p className="text-sm text-gray-600 mb-2">
                                    {lesson.description}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>
                                      ⏱️ {lesson.duration_minutes} min
                                    </span>
                                    <span>🏆 {lesson.points_value} puntos</span>
                                    {lesson.is_required && (
                                      <span className="text-red-600 font-medium">
                                        ⚠️ Obligatoria
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {canEdit() && (
                                  <div className="flex flex-col space-y-2 ml-4">
                                    <button
                                      onClick={() => setEditingLesson(lesson)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      ✏️ Editar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteLesson(lesson.id)
                                      }
                                      className="text-red-600 hover:text-red-800 text-sm font-medium"
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
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <div className="text-2xl mb-2">📖</div>
                          <p className="text-sm">
                            No hay lecciones en esta semana
                          </p>
                          {canEdit() && (
                            <button
                              onClick={() => setShowLessonForm(true)}
                              className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              ➕ Crear la primera lección
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Assignments */}
                    <div>
                      <h4 className="font-medium mb-4 flex items-center">
                        <span className="mr-2">📝</span>
                        Tareas ({assignments.length})
                      </h4>
                      {assignments.length > 0 ? (
                        <div className="space-y-3">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium mb-2">
                                    {assignment.title}
                                  </h5>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {assignment.description}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
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
                                      <span className="text-red-600 font-medium">
                                        ⚠️ Obligatoria
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {canEdit() && (
                                  <div className="flex flex-col space-y-2 ml-4">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                      ✏️ Editar
                                    </button>
                                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                      🗑️ Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <div className="text-2xl mb-2">📝</div>
                          <p className="text-sm">
                            No hay tareas en esta semana
                          </p>
                          {canEdit() && (
                            <button
                              onClick={() => setShowAssignmentForm(true)}
                              className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              ➕ Crear la primera tarea
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">👈</div>
                    <h3 className="text-lg font-medium">
                      Selecciona una semana
                    </h3>
                    <p className="text-sm">
                      Elige una semana del panel izquierdo para ver su contenido
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {(showWeekForm || editingWeek) && (
        <WeekFormModal
          week={editingWeek}
          onSave={editingWeek ? handleUpdateWeek : handleCreateWeek}
          onCancel={() => {
            setShowWeekForm(false);
            setEditingWeek(null);
          }}
          weekNumber={editingWeek ? editingWeek.week_number : weeks.length + 1}
          maxWeeks={12}
        />
      )}

      {(showLessonForm || editingLesson) && (
        <LessonFormModal
          lesson={editingLesson}
          onSave={editingLesson ? handleUpdateLesson : handleCreateLesson}
          onCancel={() => {
            setShowLessonForm(false);
            setEditingLesson(null);
          }}
          nextOrderIndex={lessons.length + 1}
        />
      )}

      {showAssignmentForm && (
        <AssignmentFormModal
          onSave={handleCreateAssignment}
          onCancel={() => setShowAssignmentForm(false)}
        />
      )}
    </div>
  );
};

export default CourseContentManager;

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

// Week Form Modal Component
interface WeekFormModalProps {
  week?: CourseWeek | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  weekNumber: number;
  maxWeeks: number;
}

const WeekFormModal: React.FC<WeekFormModalProps> = ({
  week,
  onSave,
  onCancel,
  weekNumber,
  maxWeeks,
}) => {
  const [formData, setFormData] = useState({
    week_number: week?.week_number || weekNumber,
    title: week?.title || "",
    description: week?.description || "",
    objectives: week?.objectives
      ? JSON.stringify(week.objectives, null, 2)
      : "[]",
    topics: week?.topics ? JSON.stringify(week.topics, null, 2) : "[]",
    is_locked: week?.is_locked ?? true,
    unlock_date: week?.unlock_date || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    }

    if (formData.week_number < 1 || formData.week_number > maxWeeks) {
      newErrors.week_number = `El número de semana debe estar entre 1 y ${maxWeeks}`;
    }

    try {
      JSON.parse(formData.objectives);
    } catch {
      newErrors.objectives = "Los objetivos deben ser un JSON válido";
    }

    try {
      JSON.parse(formData.topics);
    } catch {
      newErrors.topics = "Los temas deben ser un JSON válido";
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="mr-2">📅</span>
          {week ? "Editar Semana" : "Crear Nueva Semana"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Semana *
              </label>
              <input
                type="number"
                value={formData.week_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    week_number: parseInt(e.target.value),
                  })
                }
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.week_number ? "border-red-300" : "border-gray-300"
                }`}
                min="1"
                max={maxWeeks}
                required
                disabled={!!week}
              />
              {errors.week_number && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.week_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.is_locked ? "locked" : "unlocked"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_locked: e.target.value === "locked",
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="locked">🔒 Bloqueada</option>
                <option value="unlocked">🔓 Disponible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Semana *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full border rounded-md px-3 py-2 ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              required
              placeholder="ej: Introducción a JavaScript"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
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
              placeholder="Descripción detallada de lo que se aprenderá en esta semana"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 Objetivos (JSON Array)
            </label>
            <textarea
              value={formData.objectives}
              onChange={(e) =>
                setFormData({ ...formData, objectives: e.target.value })
              }
              className={`w-full border rounded-md px-3 py-2 font-mono text-sm ${
                errors.objectives ? "border-red-300" : "border-gray-300"
              }`}
              rows={4}
              placeholder='["Objetivo 1", "Objetivo 2", "Objetivo 3"]'
            />
            {errors.objectives && (
              <p className="text-red-500 text-xs mt-1">{errors.objectives}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Temas (JSON Array)
            </label>
            <textarea
              value={formData.topics}
              onChange={(e) =>
                setFormData({ ...formData, topics: e.target.value })
              }
              className={`w-full border rounded-md px-3 py-2 font-mono text-sm ${
                errors.topics ? "border-red-300" : "border-gray-300"
              }`}
              rows={4}
              placeholder='["Tema 1", "Tema 2", "Tema 3"]'
            />
            {errors.topics && (
              <p className="text-red-500 text-xs mt-1">{errors.topics}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Fecha de Disponibilidad (opcional)
            </label>
            <input
              type="date"
              value={formData.unlock_date}
              onChange={(e) =>
                setFormData({ ...formData, unlock_date: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {week ? "✏️ Actualizar" : "➕ Crear"} Semana
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lesson Form Modal Component
interface LessonFormModalProps {
  lesson?: Lesson | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  nextOrderIndex: number;
}

const LessonFormModal: React.FC<LessonFormModalProps> = ({
  lesson,
  onSave,
  onCancel,
  nextOrderIndex,
}) => {
  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    description: lesson?.description || "",
    type: lesson?.type || "reading",
    duration_minutes: lesson?.duration_minutes || 30,
    order_index: lesson?.order_index || nextOrderIndex,
    points_value: lesson?.points_value || 10,
    is_required: lesson?.is_required ?? true,
    content_url: lesson?.content_url || "",
    content_text: lesson?.content_text || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    }

    if (formData.duration_minutes < 1) {
      newErrors.duration_minutes = "La duración debe ser mayor a 0";
    }

    if (formData.points_value < 0) {
      newErrors.points_value = "Los puntos no pueden ser negativos";
    }

    if (formData.order_index < 1) {
      newErrors.order_index = "El orden debe ser mayor a 0";
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

  const lessonTypes = [
    { value: "video", label: "🎥 Video", color: "bg-red-100 text-red-800" },
    {
      value: "reading",
      label: "📖 Lectura",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "exercise",
      label: "💻 Ejercicio",
      color: "bg-green-100 text-green-800",
    },
    { value: "quiz", label: "❓ Quiz", color: "bg-yellow-100 text-yellow-800" },
    {
      value: "assignment",
      label: "📝 Tarea",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="mr-2">📖</span>
          {lesson ? "Editar Lección" : "Crear Nueva Lección"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Lección *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
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
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.order_index ? "border-red-300" : "border-gray-300"
                }`}
                min="1"
                required
              />
              {errors.order_index && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.order_index}
                </p>
              )}
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
              className={`w-full border rounded-md px-3 py-2 ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              required
              placeholder="ej: Variables y Tipos de Datos"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
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
              placeholder="Descripción de lo que se aprenderá en esta lección"
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
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.duration_minutes ? "border-red-300" : "border-gray-300"
                }`}
                min="1"
                required
              />
              {errors.duration_minutes && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.duration_minutes}
                </p>
              )}
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
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.points_value ? "border-red-300" : "border-gray-300"
                }`}
                min="0"
                required
              />
              {errors.points_value && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.points_value}
                </p>
              )}
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
              {lesson ? "✏️ Actualizar" : "➕ Crear"} Lección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assignment Form Modal Component
interface AssignmentFormModalProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    }

    if (formData.max_points < 1) {
      newErrors.max_points = "Los puntos máximos deben ser mayor a 0";
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

  const submissionTypes = [
    { value: "text", label: "📝 Texto", description: "Respuesta en texto" },
    { value: "file", label: "📎 Archivo", description: "Subir archivo" },
    { value: "url", label: "🔗 URL", description: "Enlace web" },
    {
      value: "both",
      label: "📝📎 Texto y Archivo",
      description: "Ambos tipos",
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="mr-2">📝</span>
          Crear Nueva Tarea
        </h3>

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
              className={`w-full border rounded-md px-3 py-2 ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              required
              placeholder="ej: Proyecto Final - Aplicación Web"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
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
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.max_points ? "border-red-300" : "border-gray-300"
                }`}
                min="1"
                required
              />
              {errors.max_points && (
                <p className="text-red-500 text-xs mt-1">{errors.max_points}</p>
              )}
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
                  {type.label} - {type.description}
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
