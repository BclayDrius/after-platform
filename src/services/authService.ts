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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  specialty: string;
}

class AuthService {
  // Login with email and password
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

      // Get user profile from our custom users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        // If no profile exists, create a basic one
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            email: authData.user.email || email,
            first_name: "User",
            last_name: "Name",
            role: "student",
          })
          .select()
          .single();

        if (createError) {
          console.warn("Could not create user profile:", createError);
          // Continue with basic user data
        } else {
          return {
            access: authData.session.access_token,
            refresh: authData.session.refresh_token || "",
            user: newProfile,
            id: authData.user.id,
            role: newProfile.role || "student",
          };
        }
      }

      return {
        access: authData.session.access_token,
        refresh: authData.session.refresh_token || "",
        user: profile || {
          id: authData.user.id,
          email: authData.user.email,
          first_name: "User",
          last_name: "Name",
          role: "student",
        },
        id: authData.user.id,
        role: profile?.role || "student",
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

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
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

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        specialty: userData.specialty,
        role: "student",
      });

      if (profileError) {
        console.warn("Could not create user profile:", profileError);
        // Continue anyway - profile can be created later
      } else {
        console.log("User profile created successfully");
      }

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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      specialty: data.specialty,
      aura: data.aura || 0,
      ranking: 1, // TODO: Calculate from ranking
      courses_completed: data.courses_completed || 0,
      hours_studied: data.hours_studied || 0,
      member_since:
        data.created_at?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
    };
  }
}

// Storage utilities (keeping the same interface as mockAuth)
export const authStorage = {
  setAuthData(loginResponse: LoginResponse) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", loginResponse.access);
      localStorage.setItem("refreshToken", loginResponse.refresh);
      localStorage.setItem("userId", loginResponse.id);
      localStorage.setItem("userRole", loginResponse.role);
    }
  },

  clearAuthData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  },

  getCurrentUserId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userId");
  },
};

export const authService = new AuthService();
export default authService;
