// Supabase service to replace mockAuth.ts
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];

class SupabaseService {
  // Authentication
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      access: data.session?.access_token,
      refresh: data.session?.refresh_token,
      user: profile,
      id: data.user.id,
      role: profile?.role || 'student'
    };
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    specialty: string;
  }) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw new Error(authError.message);

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user!.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        specialty: userData.specialty,
        role: 'student'
      });

    if (profileError) throw new Error(profileError.message);

    return { success: true, message: 'Usuario registrado exitosamente' };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  // User Profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);

    return {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      specialty: data.specialty,
      aura: data.aura,
      ranking: 1, // Calculate from ranking view
      courses_completed: data.courses_completed,
      hours_studied: data.hours_studied,
      member_since: data.created_at.split('T')[0]
    };
  }

  // Courses
  async getStudentCourses() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_courses')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          level,
          duration_weeks
        )
      `)
      .eq('user_id', session.session.user.id);

    if (error) throw new Error(error.message);

    return data.map(enrollment => ({
      id: enrollment.courses.id,
      title: enrollment.courses.title,
      duration: enrollment.courses.duration_weeks,
      level: enrollment.courses.level,
      status: enrollment.status,
      progress: enrollment.progress_percentage,
      description: enrollment.courses.description
    }));
  }

  async getCourseById(courseId: string) {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        course_weeks (
          *,
          lessons (*)
        )
      `)
      .eq('id', courseId)
      .single();

    if (courseError) throw new Error(courseError.message);

    // Transform data to match expected format
    const weeks = course.course_weeks.map((week: any) => ({
      week: week.week_number,
      title: week.title,
      description: week.description,
      status: 'locked', // Calculate based on user progress
      lessons: week.lessons.length,
      duration: `${Math.ceil(week.lessons.reduce((acc: number, lesson: any) => acc + lesson.duration_minutes, 0) / 60)} horas`,
      topics: week.topics || []
    }));

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: 'Instructor', // Get from instructor_id
      level: course.level,
      duration: `${course.duration_weeks} semanas`,
      progress: 0, // Calculate from user progress
      totalWeeks: course.duration_weeks,
      weeks
    };
  }

  // Rankings
  async getRanking(search: string = '') {
    let query = supabase
      .from('user_rankings')
      .select('*');

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { data, error } = await query.order('rank');

    if (error) throw new Error(error.message);

    const { data: session } = await supabase.auth.getSession();
    const currentUser = session.session ? 
      data.find(user => user.id === session.session!.user.id) : 
      null;

    return {
      ranking: data.map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        specialty: user.specialty,
        aura: user.aura,
        rank: user.rank
      })),
      user_rank: currentUser
    };
  }

  // Contact form
  async submitContactForm(formData: any) {
    // You could store contact submissions in a table
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        message: formData.message,
        company: formData.company,
        phone: formData.phone
      });

    if (error) throw new Error(error.message);

    return { success: true, message: 'Formulario enviado exitosamente' };
  }

  // Utility methods
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  async getCurrentUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user.id || null;
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;