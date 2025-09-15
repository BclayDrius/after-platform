// Real API service to replace mockAuth.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<{
      access_token: string;
      refresh_token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.access_token);
    localStorage.setItem('refreshToken', response.refresh_token);
    localStorage.setItem('userId', response.user.id);
    
    return response;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    specialty: string;
  }) {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        specialty: userData.specialty,
      }),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // User Profile
  async getUserProfile(userId: string) {
    return this.request<any>(`/users/${userId}/profile`);
  }

  async updateUserProfile(userId: string, data: any) {
    return this.request<any>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Courses
  async getCourses() {
    return this.request<any[]>('/courses');
  }

  async getCourseById(courseId: string) {
    return this.request<any>(`/courses/${courseId}`);
  }

  async getWeekContent(courseId: string, weekId: number) {
    return this.request<any>(`/courses/${courseId}/weeks/${weekId}`);
  }

  async enrollInCourse(courseId: string) {
    return this.request<any>(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  // Progress tracking
  async markLessonComplete(lessonId: string) {
    return this.request<any>(`/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
  }

  async getUserProgress(courseId: string) {
    return this.request<any>(`/courses/${courseId}/progress`);
  }

  // Rankings
  async getRanking(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<{
      ranking: any[];
      user_rank?: any;
    }>(`/rankings${params}`);
  }

  // Assignments
  async getAssignments(weekId: string) {
    return this.request<any[]>(`/weeks/${weekId}/assignments`);
  }

  async submitAssignment(assignmentId: string, submission: any) {
    return this.request<any>(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  // Contact form
  async submitContactForm(formData: any) {
    return this.request<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  }
}

export const apiService = new ApiService();
export default apiService;