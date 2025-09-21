// Simplified Supabase auth service for login
import { supabase } from "@/lib/supabase";

export interface LoginResponse {
  access: string;
  refresh: string;
  user: any;
  id: string;
  role: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  specialty: string;
}

class AuthService {
  // Login with email and password Xd
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user || !authData.session) {
        throw new Error("Login failed - no user data returned");
      }

      // Supabase handles the session automatically, no need for localStorage
      return {
        access: authData.session.access_token,
        refresh: authData.session.refresh_token || "",
        user: authData.user,
        id: authData.user.id,
        role: "student", // We'll get this from the profile
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterData) {
    try {
      console.log("Starting registration for:", userData.email);

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            specialty: userData.specialty,
            role: "student",
          },
        },
      });

      console.log("Supabase auth response:", { authData, authError });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Registration failed - no user created");
      }

      console.log("User created successfully:", authData.user.id);

      // Skip user profile creation for now - let the trigger handle it
      console.log(
        "User created successfully, profile will be created by trigger"
      );

      return {
        success: true,
        message:
          "Usuario registrado exitosamente. Revisa tu email para confirmar tu cuenta.",
      };
    } catch (error) {
      console.error("Registration error:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          throw new Error(
            "Error de conexión. Verifica tu configuración de Supabase."
          );
        }
        throw error;
      }

      throw new Error("Error desconocido durante el registro");
    }
  }

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  }

  // Get current user ID
  async getCurrentUserId(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user.id || null;
  }

  // Get user profile
  async getUserProfile(userId: string) {
    console.log("Getting profile for user:", userId);

    // Get from public.users table
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    console.log("Profile from users table:", { profileData, profileError });

    if (profileData) {
      // Get email from auth.users
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const email = session?.user?.email || "No email";

      return {
        first_name: profileData.first_name || "Usuario",
        last_name: profileData.last_name || "Nuevo",
        email: email,
        specialty: profileData.specialty || "No definida",
        aura: profileData.aura || 0,
        ranking: profileData.ranking || 1,
        courses_completed: profileData.courses_completed || 0,
        hours_studied: profileData.hours_studied || 0,
        member_since:
          profileData.created_at?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
      };
    }

    // Fallback: default profile
    console.log("No profile found in users table, returning default");
    return {
      first_name: "Usuario",
      last_name: "Nuevo",
      email: "usuario@example.com",
      specialty: "No definida",
      aura: 0,
      ranking: 1,
      courses_completed: 0,
      hours_studied: 0,
      member_since: new Date().toISOString().split("T")[0],
    };
  }

  // Contact form submission (placeholder)
  async submitContactForm(formData: any) {
    // TODO: Implement contact form submission with Supabase
    console.log("Contact form submitted:", formData);
    return { success: true, message: "Formulario enviado exitosamente" };
  }

  // Get ranking (placeholder)
  async getRanking(search: string = "") {
    // TODO: Implement ranking system with Supabase
    return {
      ranking: [],
      user_rank: null,
    };
  }

  // Get student courses (placeholder)
  async getStudentCourses() {
    // TODO: Implement course fetching with Supabase
    return [
      {
        id: 1,
        title: "JavaScript Fundamentals",
        duration: 8,
        level: "Principiante",
        status: "En Progreso",
        progress: 65,
        description: "Aprende los fundamentos de JavaScript desde cero",
      },
    ];
  }

  // Get teacher courses (placeholder)
  async getTeacherCourses() {
    // TODO: Implement teacher course fetching with Supabase
    return [
      {
        id: 1,
        title: "JavaScript Fundamentals",
        duration: 8,
        level: "Principiante",
        status: "En Progreso",
        progress: 65,
        description: "Aprende los fundamentos de JavaScript desde cero",
        students: [
          {
            student_id: "1",
            student_name: "Ana García",
            completed: false,
            merit_points: 85,
          },
        ],
      },
    ];
  }
}

// Storage utilities using Supabase sessions
export const authStorage = {
  setAuthData(loginResponse: LoginResponse) {
    // Supabase handles session storage automatically
    console.log("Auth data set via Supabase session");
  },

  async clearAuthData() {
    await supabase.auth.signOut();
  },

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  },

  async getCurrentUserId(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user.id || null;
  },
};

export const authService = new AuthService();
export default authService;
