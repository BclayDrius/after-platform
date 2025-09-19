"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import { authService, authStorage } from "@/services/authService";
import styles from "./courses.module.scss";

// -----------------------
// Helper fetch con JWT
// -----------------------
async function fetchAPI(
  endpoint: string,
  method = "GET",
  data: any = null,
  token: string | null = null
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config: RequestInit = { method, headers };
  if (data) config.body = JSON.stringify(data);

  const res = await fetch(endpoint, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.detail || `API request failed with status ${res.status}`
    );
  }
  return res.json();
}

// -----------------------
// Tipado de cursos
// -----------------------
interface Course {
  id: number;
  title: string;
  duration: number;
  level: string;
  status?: string;
  progress?: number;
  students?: Array<{
    student_id: string;
    student_name: string;
    completed: boolean;
    merit_points: number;
  }>;
}

// -----------------------
// Tipado de usuario
// -----------------------
interface UserProfile {
  id: number;
  username: string;
  role: "student" | "teacher" | "admin";
}

// -----------------------
// Decodificador JWT
// -----------------------
function parseJwt(token: string): UserProfile | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// -----------------------
// Componente Courses
// -----------------------
export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          setError("No JWT token found, please login.");
          return;
        }

        const decodedUser = parseJwt(token);

        // Validación segura
        if (!decodedUser || !("role" in decodedUser)) {
          setLoading(false);
          setError("Invalid token, please login again.");
          return;
        }

        // Forzar role a minúscula para consistencia
        const allowedRoles = ["student", "teacher", "admin"] as const;
        const role = (decodedUser.role as string).toLowerCase();

        if (allowedRoles.includes(role as any)) {
          decodedUser.role = role as (typeof allowedRoles)[number];
        } else {
          // Asigna un valor por defecto o maneja el error
          decodedUser.role = "student";
        }

        setUser(decodedUser);

        // Obtener cursos según el rol
        const coursesData =
          decodedUser.role === "teacher"
            ? await authService.getTeacherCourses()
            : await authService.getStudentCourses();

        setCourses(coursesData);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "message" in err) {
          setError((err as { message: string }).message);
        } else {
          setError("Error al cargar los cursos");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout
        title={
          user?.role === "teacher" ? "Courses I Teach" : "My Learning Path"
        }
      >
        <div className={styles.coursesContainer}>
          <div className={styles.coursesHeader}>
            <h2>
              {user?.role === "teacher"
                ? "Courses I Teach"
                : "My Learning Path"}
            </h2>
            <p>
              {user?.role === "teacher"
                ? "Manage your courses and track student progress"
                : "Track your progress across all enrolled courses"}
            </p>
          </div>

          {courses.length === 0 ? (
            <p>No courses found.</p>
          ) : (
            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.courseHeader}>
                    <h3>{course.title}</h3>
                    {user?.role === "student" && (
                      <span
                        className={`${styles.status} ${
                          styles[
                            course.status?.replace(" ", "").toLowerCase() || ""
                          ]
                        }`}
                      >
                        {course.status}
                      </span>
                    )}
                  </div>

                  {user?.role === "student" && (
                    <div className={styles.courseProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className={styles.progressText}>
                        {course.progress || 0}%
                      </span>
                    </div>
                  )}

                  <div className={styles.courseDetails}>
                    <div className={styles.detail}>
                      <span>⏱️</span> {course.duration} weeks
                    </div>
                    <div className={styles.detail}>
                      <span>📊</span> {course.level}
                    </div>
                    {user?.role === "teacher" && course.students && (
                      <div className={styles.detail}>
                        <span>👩‍🎓</span> {course.students.length} enrolled
                      </div>
                    )}
                  </div>

                  <button
                    className={styles.continueBtn}
                    onClick={() => {
                      // Mapear títulos a IDs de curso
                      const courseMap: Record<string, string> = {
                        "JavaScript Fundamentals": "javascript",
                        "React Development": "react",
                        "Node.js Backend": "nodejs",
                        "TypeScript Avanzado": "typescript",
                      };
                      const courseId = courseMap[course.title] || "javascript";
                      window.location.href = `/courses/${courseId}`;
                    }}
                  >
                    {user?.role === "student"
                      ? course.progress === 0
                        ? "Start Course"
                        : course.progress === 100
                        ? "Review"
                        : "Continue"
                      : "Manage Course"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
