// Role-based service for After Life Academy
import { supabase } from "@/lib/supabase";

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  specialty?: string;
  aura: number;
  courses_completed: number;
  hours_studied: number;
  bio?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  level: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  total_lessons: number;
  is_active: boolean;
  max_students: number;
  current_students: number;
  created_at: string;
  updated_at: string;
}

export interface CourseWeek {
  id: string;
  course_id: string;
  week_number: number;
  title: string;
  description?: string;
  objectives: string[];
  topics: string[];
  is_locked: boolean;
  unlock_date?: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  week_id: string;
  title: string;
  description?: string;
  type: "video" | "reading" | "exercise" | "quiz" | "assignment";
  duration_minutes: number;
  content_url?: string;
  content_text?: string;
  order_index: number;
  is_required: boolean;
  points_value: number;
  created_at: string;
}

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  enrolled_by: string;
  progress_percentage: number;
  current_week: number;
  status: "active" | "completed" | "paused" | "withdrawn";
  completion_date?: string;
  final_grade?: number;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  course_id: string;
  reason?: string;
  status: "pending" | "approved" | "denied";
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

class RoleService {
  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", role)
      .eq("is_active", true)
      .order("first_name");

    if (error) throw error;
    return data || [];
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Solo los administradores pueden cambiar roles");
    }

    const { error } = await supabase
      .from("users")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;
  }

  // ============================================================================
  // COURSE MANAGEMENT
  // ============================================================================

  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        course_instructors!inner(instructor_id)
      `
      )
      .eq("course_instructors.instructor_id", instructorId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createCourse(
    courseData: Omit<
      Course,
      "id" | "created_at" | "updated_at" | "current_students"
    >
  ): Promise<Course> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || !["teacher", "admin"].includes(currentUser.role)) {
      throw new Error(
        "Solo los profesores y administradores pueden crear cursos"
      );
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        ...courseData,
        creator_id: currentUser.id,
        current_students: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as instructor
    await supabase.from("course_instructors").insert({
      course_id: data.id,
      instructor_id: currentUser.id,
      role: "creator",
      added_by: currentUser.id,
    });

    // Create 12 weeks for the course
    const weeks = Array.from({ length: 12 }, (_, i) => ({
      course_id: data.id,
      week_number: i + 1,
      title: `Semana ${i + 1}`,
      description: `Contenido de la semana ${i + 1}`,
      objectives: [],
      topics: [],
      is_locked: i > 0, // Only first week unlocked by default
      unlock_date: i === 0 ? new Date().toISOString().split("T")[0] : null,
    }));

    await supabase.from("course_weeks").insert(weeks);

    return data;
  }

  async updateCourse(
    courseId: string,
    updates: Partial<Course>
  ): Promise<void> {
    const canManage = await this.canManageCourse(courseId);
    if (!canManage) {
      throw new Error("No tienes permisos para modificar este curso");
    }

    const { error } = await supabase
      .from("courses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", courseId);

    if (error) throw error;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error("Usuario no autenticado");

    // Check if user is admin or course creator
    const { data: course } = await supabase
      .from("courses")
      .select("creator_id")
      .eq("id", courseId)
      .single();

    if (!course) throw new Error("Curso no encontrado");

    if (currentUser.role !== "admin" && course.creator_id !== currentUser.id) {
      throw new Error(
        "Solo el creador del curso o un administrador pueden eliminarlo"
      );
    }

    const { error } = await supabase
      .from("courses")
      .update({ is_active: false })
      .eq("id", courseId);

    if (error) throw error;
  }

  // ============================================================================
  // INSTRUCTOR MANAGEMENT
  // ============================================================================

  async addInstructorToCourse(
    courseId: string,
    instructorId: string
  ): Promise<void> {
    const canManage = await this.canManageCourse(courseId);
    if (!canManage) {
      throw new Error(
        "No tienes permisos para agregar instructores a este curso"
      );
    }

    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error("Usuario no autenticado");

    // Verify the instructor is actually a teacher
    const { data: instructor } = await supabase
      .from("users")
      .select("role")
      .eq("id", instructorId)
      .single();

    if (!instructor || !["teacher", "admin"].includes(instructor.role)) {
      throw new Error("Solo se pueden agregar profesores como instructores");
    }

    const { error } = await supabase.from("course_instructors").insert({
      course_id: courseId,
      instructor_id: instructorId,
      role: "instructor",
      added_by: currentUser.id,
    });

    if (error) throw error;
  }

  async removeInstructorFromCourse(
    courseId: string,
    instructorId: string
  ): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error("Usuario no autenticado");

    // Check if user is admin or course creator
    const { data: course } = await supabase
      .from("courses")
      .select("creator_id")
      .eq("id", courseId)
      .single();

    if (!course) throw new Error("Curso no encontrado");

    if (currentUser.role !== "admin" && course.creator_id !== currentUser.id) {
      throw new Error(
        "Solo el creador del curso o un administrador pueden remover instructores"
      );
    }

    // Don't allow removing the creator
    if (instructorId === course.creator_id) {
      throw new Error("No se puede remover al creador del curso");
    }

    const { error } = await supabase
      .from("course_instructors")
      .delete()
      .eq("course_id", courseId)
      .eq("instructor_id", instructorId);

    if (error) throw error;
  }

  // ============================================================================
  // STUDENT ENROLLMENT
  // ============================================================================

  async enrollStudent(courseId: string, studentId: string): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error("Usuario no autenticado");

    // Si es un estudiante inscribiéndose a sí mismo, permitir auto-inscripción
    if (currentUser.role === "student" && currentUser.id === studentId) {
      return this.selfEnrollInCourse(courseId);
    }

    // Para admin/teacher inscribiendo a otros estudiantes
    const canManage = await this.canManageCourse(courseId);
    if (!canManage) {
      throw new Error(
        "No tienes permisos para inscribir estudiantes en este curso"
      );
    }

    // Verify the user is actually a student
    const { data: student } = await supabase
      .from("users")
      .select("role")
      .eq("id", studentId)
      .single();

    if (!student || student.role !== "student") {
      throw new Error("Solo se pueden inscribir estudiantes");
    }

    const { error } = await supabase.from("user_courses").insert({
      user_id: studentId,
      course_id: courseId,
      enrolled_by: currentUser.id,
      current_week: 1,
      progress_percentage: 0,
      status: "active",
    });

    if (error) throw error;

    // Unlock first week for the student
    const { data: firstWeek } = await supabase
      .from("course_weeks")
      .select("id")
      .eq("course_id", courseId)
      .eq("week_number", 1)
      .single();

    if (firstWeek) {
      await supabase.from("user_week_unlocks").insert({
        user_id: studentId,
        week_id: firstWeek.id,
        unlocked_by: currentUser.id,
        auto_unlocked: false,
      });
    }

    // Update course student count
    await supabase.rpc("increment_course_students", { course_id: courseId });
  }

  async selfEnrollInCourse(courseId: string): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== "student") {
      throw new Error("Solo los estudiantes pueden auto-inscribirse");
    }

    // Verificar que el curso existe y está activo
    const { data: course } = await supabase
      .from("courses")
      .select("id, max_students, current_students, is_active")
      .eq("id", courseId)
      .eq("is_active", true)
      .single();

    if (!course) {
      throw new Error("Curso no encontrado o no está disponible");
    }

    // Verificar que hay cupo disponible
    if (course.current_students >= course.max_students) {
      throw new Error("El curso ha alcanzado su capacidad máxima");
    }

    // Verificar que no esté ya inscrito
    const { data: existingEnrollment } = await supabase
      .from("user_courses")
      .select("status")
      .eq("user_id", currentUser.id)
      .eq("course_id", courseId)
      .single();

    if (existingEnrollment) {
      if (existingEnrollment.status === "active") {
        throw new Error("Ya estás inscrito en este curso");
      } else if (existingEnrollment.status === "withdrawn") {
        // Reactivar inscripción
        const { error } = await supabase
          .from("user_courses")
          .update({
            status: "active",
            enrolled_at: new Date().toISOString(),
          })
          .eq("user_id", currentUser.id)
          .eq("course_id", courseId);

        if (error) throw error;
        await supabase.rpc("increment_course_students", {
          course_id: courseId,
        });
        return;
      }
    }

    // Crear nueva inscripción
    const { error } = await supabase.from("user_courses").insert({
      user_id: currentUser.id,
      course_id: courseId,
      enrolled_by: currentUser.id, // Auto-inscripción
      current_week: 1,
      progress_percentage: 0,
      status: "active",
    });

    if (error) throw error;

    // Desbloquear primera semana automáticamente
    const { data: firstWeek } = await supabase
      .from("course_weeks")
      .select("id")
      .eq("course_id", courseId)
      .eq("week_number", 1)
      .single();

    if (firstWeek) {
      await supabase.from("user_week_unlocks").insert({
        user_id: currentUser.id,
        week_id: firstWeek.id,
        unlocked_by: currentUser.id,
        auto_unlocked: true,
      });
    }

    // Actualizar contador de estudiantes
    await supabase.rpc("increment_course_students", { course_id: courseId });
  }

  async removeStudentFromCourse(
    courseId: string,
    studentId: string
  ): Promise<void> {
    const canManage = await this.canManageCourse(courseId);
    if (!canManage) {
      throw new Error(
        "No tienes permisos para remover estudiantes de este curso"
      );
    }

    const { error } = await supabase
      .from("user_courses")
      .update({ status: "withdrawn" })
      .eq("course_id", courseId)
      .eq("user_id", studentId);

    if (error) throw error;

    // Update course student count
    await supabase.rpc("decrement_course_students", { course_id: courseId });
  }

  // ============================================================================
  // WITHDRAWAL REQUESTS
  // ============================================================================

  async requestWithdrawal(courseId: string, reason?: string): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== "student") {
      throw new Error(
        "Solo los estudiantes pueden solicitar retirarse de un curso"
      );
    }

    // Check if student is enrolled
    const { data: enrollment } = await supabase
      .from("user_courses")
      .select("status")
      .eq("course_id", courseId)
      .eq("user_id", currentUser.id)
      .single();

    if (!enrollment || enrollment.status !== "active") {
      throw new Error("No estás inscrito en este curso");
    }

    const { error } = await supabase.from("course_withdrawal_requests").insert({
      user_id: currentUser.id,
      course_id: courseId,
      reason: reason || "",
      status: "pending",
    });

    if (error) throw error;
  }

  async getWithdrawalRequests(courseId?: string): Promise<WithdrawalRequest[]> {
    let query = supabase
      .from("course_withdrawal_requests")
      .select(
        `
        *,
        users!course_withdrawal_requests_user_id_fkey(first_name, last_name, email),
        courses!course_withdrawal_requests_course_id_fkey(title)
      `
      )
      .order("requested_at", { ascending: false });

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async reviewWithdrawalRequest(
    requestId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || !["teacher", "admin"].includes(currentUser.role)) {
      throw new Error(
        "Solo los profesores y administradores pueden revisar solicitudes"
      );
    }

    const { data: request } = await supabase
      .from("course_withdrawal_requests")
      .select("user_id, course_id")
      .eq("id", requestId)
      .single();

    if (!request) throw new Error("Solicitud no encontrada");

    // Check if user can manage the course
    const canManage = await this.canManageCourse(request.course_id);
    if (!canManage) {
      throw new Error("No tienes permisos para revisar esta solicitud");
    }

    const { error } = await supabase
      .from("course_withdrawal_requests")
      .update({
        status: approved ? "approved" : "denied",
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
      })
      .eq("id", requestId);

    if (error) throw error;

    // If approved, remove student from course
    if (approved) {
      await this.removeStudentFromCourse(request.course_id, request.user_id);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async canManageCourse(courseId: string): Promise<boolean> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return false;

    // Admin can manage all courses
    if (currentUser.role === "admin") return true;

    // Check if user is creator or instructor
    const { data } = await supabase
      .from("course_instructors")
      .select("role")
      .eq("course_id", courseId)
      .eq("instructor_id", currentUser.id)
      .single();

    return !!data;
  }

  async canAccessCourse(courseId: string): Promise<boolean> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return false;

    // Admin can access all courses
    if (currentUser.role === "admin") return true;

    // Check if user is instructor
    const { data: instructor } = await supabase
      .from("course_instructors")
      .select("id")
      .eq("course_id", courseId)
      .eq("instructor_id", currentUser.id)
      .single();

    if (instructor) return true;

    // Check if user is enrolled as student
    const { data: enrollment } = await supabase
      .from("user_courses")
      .select("status")
      .eq("course_id", courseId)
      .eq("user_id", currentUser.id)
      .single();

    return enrollment?.status === "active";
  }

  async getStudentCourses(): Promise<Course[]> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== "student") return [];

    const { data, error } = await supabase
      .from("user_courses")
      .select(
        `
        courses(*)
      `
      )
      .eq("user_id", currentUser.id)
      .eq("status", "active");

    if (error) throw error;
    return (data?.map((item: any) => item.courses).filter(Boolean) ||
      []) as Course[];
  }

  // ============================================================================
  // CONTENT MANAGEMENT - WEEKS, LESSONS, ASSIGNMENTS
  // ============================================================================

  async getCourseWeeks(courseId: string): Promise<CourseWeek[]> {
    const canAccess = await this.canAccessCourse(courseId);
    if (!canAccess) {
      throw new Error("No tienes acceso a este curso");
    }

    const { data, error } = await supabase
      .from("course_weeks")
      .select("*")
      .eq("course_id", courseId)
      .order("week_number");

    if (error) throw error;
    return data || [];
  }

  async createCourseWeek(
    courseId: string,
    weekData: Omit<CourseWeek, "id" | "created_at">
  ): Promise<CourseWeek> {
    const canManage = await this.canManageCourse(courseId);
    if (!canManage) {
      throw new Error("No tienes permisos para crear semanas en este curso");
    }

    // Verificar que no exceda 12 semanas
    const { count } = await supabase
      .from("course_weeks")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId);

    if (count && count >= 12) {
      throw new Error("Un curso no puede tener más de 12 semanas");
    }

    const { data, error } = await supabase
      .from("course_weeks")
      .insert(weekData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCourseWeek(
    weekId: string,
    updates: Partial<CourseWeek>
  ): Promise<void> {
    // Verificar permisos
    const { data: week } = await supabase
      .from("course_weeks")
      .select("course_id")
      .eq("id", weekId)
      .single();

    if (!week) throw new Error("Semana no encontrada");

    const canManage = await this.canManageCourse(week.course_id);
    if (!canManage) {
      throw new Error("No tienes permisos para editar esta semana");
    }

    const { error } = await supabase
      .from("course_weeks")
      .update(updates)
      .eq("id", weekId);

    if (error) throw error;
  }

  async deleteCourseWeek(weekId: string): Promise<void> {
    const { data: week } = await supabase
      .from("course_weeks")
      .select("course_id")
      .eq("id", weekId)
      .single();

    if (!week) throw new Error("Semana no encontrada");

    const canManage = await this.canManageCourse(week.course_id);
    if (!canManage) {
      throw new Error("No tienes permisos para eliminar esta semana");
    }

    const { error } = await supabase
      .from("course_weeks")
      .delete()
      .eq("id", weekId);

    if (error) throw error;
  }

  // ============================================================================
  // LESSON MANAGEMENT
  // ============================================================================

  async getWeekLessons(weekId: string): Promise<Lesson[]> {
    // Verificar acceso al curso
    const { data: week } = await supabase
      .from("course_weeks")
      .select("course_id")
      .eq("id", weekId)
      .single();

    if (!week) throw new Error("Semana no encontrada");

    const canAccess = await this.canAccessCourse(week.course_id);
    if (!canAccess) {
      throw new Error("No tienes acceso a este contenido");
    }

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("week_id", weekId)
      .order("order_index");

    if (error) throw error;
    return data || [];
  }

  async createLesson(
    weekId: string,
    lessonData: Omit<Lesson, "id" | "created_at">
  ): Promise<Lesson> {
    // Verificar permisos
    const { data: week } = await supabase
      .from("course_weeks")
      .select("course_id")
      .eq("id", weekId)
      .single();

    if (!week) throw new Error("Semana no encontrada");

    const canManage = await this.canManageCourse(week.course_id);
    if (!canManage) {
      throw new Error("No tienes permisos para crear lecciones en este curso");
    }

    const { data, error } = await supabase
      .from("lessons")
      .insert({ ...lessonData, week_id: weekId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLesson(
    lessonId: string,
    updates: Partial<Lesson>
  ): Promise<void> {
    // Verificar permisos
    const { data: lesson } = await supabase
      .from("lessons")
      .select(
        `
        week_id,
        course_weeks!inner(course_id)
      `
      )
      .eq("id", lessonId)
      .single();

    if (!lesson) throw new Error("Lección no encontrada");

    const canManage = await this.canManageCourse(
      (lesson as any).course_weeks.course_id
    );
    if (!canManage) {
      throw new Error("No tienes permisos para editar esta lección");
    }

    const { error } = await supabase
      .from("lessons")
      .update(updates)
      .eq("id", lessonId);

    if (error) throw error;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    // Verificar permisos
    const { data: lesson } = await supabase
      .from("lessons")
      .select(
        `
        week_id,
        course_weeks!inner(course_id)
      `
      )
      .eq("id", lessonId)
      .single();

    if (!lesson) throw new Error("Lección no encontrada");

    const canManage = await this.canManageCourse(
      (lesson as any).course_weeks.course_id
    );
    if (!canManage) {
      throw new Error("No tienes permisos para eliminar esta lección");
    }

    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) throw error;
  }

  // ============================================================================
  // ASSIGNMENT MANAGEMENT
  // ============================================================================

  async getWeekAssignments(weekId: string): Promise<any[]> {
    // Verificar acceso
    const { data: week } = await supabase
      .from("course_weeks")
      .select("course_id")
      .eq("id", weekId)
      .single();

    if (!week) throw new Error("Semana no encontrada");

    const canAccess = await this.canAccessCourse(week.course_id);
    if (!canAccess) {
      throw new Error("No tienes acceso a este contenido");
    }

    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("week_id", weekId)
      .order("created_at");

    if (error) throw error;
    return data || [];
  }

  async createAssignment(weekId: string, assignmentData: any): Promise<any> {
    // Verificar permisos
    const { data: week } = await supabase
      .from("course_weeks")
      .select("course_id")
      .eq("id", weekId)
      .single();

    if (!week) throw new Error("Semana no encontrada");

    const canManage = await this.canManageCourse(week.course_id);
    if (!canManage) {
      throw new Error("No tienes permisos para crear tareas en este curso");
    }

    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from("assignments")
      .insert({
        ...assignmentData,
        week_id: weekId,
        created_by: currentUser.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAssignment(assignmentId: string, updates: any): Promise<void> {
    // Verificar permisos
    const { data: assignment } = await supabase
      .from("assignments")
      .select(
        `
        week_id,
        course_weeks!inner(course_id)
      `
      )
      .eq("id", assignmentId)
      .single();

    if (!assignment) throw new Error("Tarea no encontrada");

    const canManage = await this.canManageCourse(
      (assignment as any).course_weeks.course_id
    );
    if (!canManage) {
      throw new Error("No tienes permisos para editar esta tarea");
    }

    const { error } = await supabase
      .from("assignments")
      .update(updates)
      .eq("id", assignmentId);

    if (error) throw error;
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    // Verificar permisos
    const { data: assignment } = await supabase
      .from("assignments")
      .select(
        `
        week_id,
        course_weeks!inner(course_id)
      `
      )
      .eq("id", assignmentId)
      .single();

    if (!assignment) throw new Error("Tarea no encontrada");

    const canManage = await this.canManageCourse(
      (assignment as any).course_weeks.course_id
    );
    if (!canManage) {
      throw new Error("No tienes permisos para eliminar esta tarea");
    }

    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) throw error;
  }

  // ============================================================================
  // WEEK UNLOCK MANAGEMENT
  // ============================================================================

  async unlockWeekForStudent(weekId: string, studentId: string): Promise<void> {
    // Verificar permisos
    const { data: week } = await supabase
      .from("course_weeks")
      .select("course_id")
      .eq("id", weekId)
      .single();

    if (!week) throw new Error("Semana no encontrada");

    const canManage = await this.canManageCourse(week.course_id);
    if (!canManage) {
      throw new Error(
        "No tienes permisos para desbloquear semanas en este curso"
      );
    }

    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error("Usuario no autenticado");

    const { error } = await supabase.from("user_week_unlocks").insert({
      user_id: studentId,
      week_id: weekId,
      unlocked_by: currentUser.id,
      auto_unlocked: false,
    });

    if (error && error.code !== "23505") {
      // Ignore duplicate key error
      throw error;
    }
  }

  async lockWeekForStudent(weekId: string, studentId: string): Promise<void> {
    // Verificar permisos
    const { data: week } = await supabase
      .from("course_weeks")
      .select("course_id")
      .eq("id", weekId)
      .single();

    if (!week) throw new Error("Semana no encontrada");

    const canManage = await this.canManageCourse(week.course_id);
    if (!canManage) {
      throw new Error("No tienes permisos para bloquear semanas en este curso");
    }

    const { error } = await supabase
      .from("user_week_unlocks")
      .delete()
      .eq("user_id", studentId)
      .eq("week_id", weekId);

    if (error) throw error;
  }
}

export const roleService = new RoleService();
