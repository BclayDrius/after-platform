"use client";

import React, { useState, useEffect } from "react";
import {
  roleService,
  User,
  Course,
  WithdrawalRequest,
} from "@/services/roleService";

interface CourseManagerProps {
  currentUser: User;
}

const CourseManager: React.FC<CourseManagerProps> = ({ currentUser }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"courses" | "requests">("courses");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    level: "beginner" as const,
    max_students: 50,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      if (currentUser.role === "admin") {
        const [coursesData, requestsData] = await Promise.all([
          roleService.getCourses(),
          roleService.getWithdrawalRequests(),
        ]);
        setCourses(coursesData);
        setWithdrawalRequests(requestsData);
      } else if (currentUser.role === "teacher") {
        const [coursesData, requestsData] = await Promise.all([
          roleService.getCoursesByInstructor(currentUser.id),
          roleService.getWithdrawalRequests(),
        ]);
        setCourses(coursesData);
        setWithdrawalRequests(requestsData);
      } else {
        // Students can only see their own courses
        const coursesData = await roleService.getStudentCourses();
        setCourses(coursesData);
      }
    } catch (err) {
      setError("Error al cargar datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roleService.createCourse({
        ...newCourse,
        creator_id: currentUser.id,
        duration_weeks: 12,
        total_lessons: 0,
        is_active: true,
      });

      setNewCourse({
        title: "",
        description: "",
        level: "beginner",
        max_students: 50,
      });
      setShowCreateForm(false);
      await loadData();
      alert("Curso creado exitosamente");
    } catch (err) {
      setError("Error al crear el curso");
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este curso?")) return;

    try {
      await roleService.deleteCourse(courseId);
      await loadData();
      alert("Curso eliminado exitosamente");
    } catch (err) {
      setError("Error al eliminar el curso");
      console.error(err);
    }
  };

  const handleWithdrawalRequest = async (
    requestId: string,
    approved: boolean
  ) => {
    const notes = prompt(
      approved ? "Notas de aprobación (opcional):" : "Razón del rechazo:"
    );

    try {
      await roleService.reviewWithdrawalRequest(
        requestId,
        approved,
        notes || undefined
      );
      await loadData();
      alert(`Solicitud ${approved ? "aprobada" : "rechazada"} exitosamente`);
    } catch (err) {
      setError("Error al procesar la solicitud");
      console.error(err);
    }
  };

  const requestWithdrawal = async (courseId: string) => {
    const reason = prompt("¿Por qué quieres retirarte de este curso?");
    if (reason === null) return; // User cancelled

    try {
      await roleService.requestWithdrawal(courseId, reason);
      alert("Solicitud de retiro enviada. Será revisada por los instructores.");
    } catch (err) {
      setError("Error al enviar la solicitud");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {currentUser.role === "student" ? "Mis Cursos" : "Gestión de Cursos"}
        </h2>

        {["teacher", "admin"].includes(currentUser.role) && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Crear Curso
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tabs for teachers and admins */}
      {["teacher", "admin"].includes(currentUser.role) && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "requests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Solicitudes de Retiro (
                {
                  withdrawalRequests.filter((r) => r.status === "pending")
                    .length
                }
                )
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Crear Nuevo Curso</h3>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Curso
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel
                </label>
                <select
                  value={newCourse.level}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, level: e.target.value as any })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Estudiantes
                </label>
                <input
                  type="number"
                  value={newCourse.max_students}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      max_students: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min="1"
                  max="200"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Crear Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {(activeTab === "courses" || currentUser.role === "student") && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{course.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nivel:</span>
                  <span className="capitalize">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duración:</span>
                  <span>{course.duration_weeks} semanas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estudiantes:</span>
                  <span>
                    {course.current_students}/{course.max_students}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                {currentUser.role === "student" ? (
                  <button
                    onClick={() => requestWithdrawal(course.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Solicitar Retiro
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawal Requests Tab */}
      {activeTab === "requests" &&
        ["teacher", "admin"].includes(currentUser.role) && (
          <div className="space-y-4">
            {withdrawalRequests
              .filter((r) => r.status === "pending")
              .map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Solicitud de Retiro</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Estudiante:</strong>{" "}
                        {(request as any).users?.first_name}{" "}
                        {(request as any).users?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Curso:</strong>{" "}
                        {(request as any).courses?.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Razón:</strong>{" "}
                        {request.reason || "No especificada"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Solicitado el:{" "}
                        {new Date(request.requested_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="space-x-2">
                      <button
                        onClick={() =>
                          handleWithdrawalRequest(request.id, true)
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() =>
                          handleWithdrawalRequest(request.id, false)
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {withdrawalRequests.filter((r) => r.status === "pending").length ===
              0 && (
              <div className="text-center py-8 text-gray-500">
                No hay solicitudes de retiro pendientes.
              </div>
            )}
          </div>
        )}

      {courses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {currentUser.role === "student"
            ? "No estás inscrito en ningún curso."
            : "No hay cursos disponibles."}
        </div>
      )}
    </div>
  );
};

export default CourseManager;
