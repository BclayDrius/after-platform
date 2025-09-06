// Sistema de autenticación mock para desarrollo sin backend

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  specialty?: string;
  aura: number;
  ranking: number;
  coursesCompleted: number;
  hoursStudied: number;
  memberSince: string;
}

export interface MockCourse {
  id: number;
  title: string;
  duration: number;
  level: string;
  status: string;
  progress: number;
  description: string;
}

// Usuarios de prueba
const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'student@test.com',
    firstName: 'Ana',
    lastName: 'García',
    role: 'student',
    specialty: 'Desarrollo Web',
    aura: 1250,
    ranking: 15,
    coursesCompleted: 8,
    hoursStudied: 120,
    memberSince: '2024-01-15'
  },
  {
    id: '2',
    email: 'teacher@test.com',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    role: 'teacher',
    specialty: 'JavaScript',
    aura: 2500,
    ranking: 3,
    coursesCompleted: 25,
    hoursStudied: 500,
    memberSince: '2023-06-10'
  },
  {
    id: '3',
    email: 'admin@test.com',
    firstName: 'María',
    lastName: 'López',
    role: 'admin',
    specialty: 'Gestión de Proyectos',
    aura: 3000,
    ranking: 1,
    coursesCompleted: 30,
    hoursStudied: 800,
    memberSince: '2023-01-01'
  }
];

// Cursos de prueba
const mockCourses: MockCourse[] = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    duration: 8,
    level: 'Principiante',
    status: 'En Progreso',
    progress: 65,
    description: 'Aprende los fundamentos de JavaScript desde cero'
  },
  {
    id: 2,
    title: 'React Development',
    duration: 12,
    level: 'Intermedio',
    status: 'Completado',
    progress: 100,
    description: 'Domina React y construye aplicaciones modernas'
  },
  {
    id: 3,
    title: 'Node.js Backend',
    duration: 10,
    level: 'Intermedio',
    status: 'No Iniciado',
    progress: 0,
    description: 'Desarrolla APIs robustas con Node.js'
  },
  {
    id: 4,
    title: 'TypeScript Avanzado',
    duration: 6,
    level: 'Avanzado',
    status: 'En Progreso',
    progress: 30,
    description: 'Lleva tus habilidades de TypeScript al siguiente nivel'
  }
];

// Generar JWT mock
function generateMockJWT(user: MockUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  }));
  const signature = btoa('mock-signature');
  
  return `${header}.${payload}.${signature}`;
}

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  // Login simulado
  async login(email: string, password: string) {
    await delay(1000); // Simular latencia de red
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'password123') {
      throw new Error('Credenciales inválidas');
    }
    
    const token = generateMockJWT(user);
    
    return {
      access: token,
      refresh: `refresh_${token}`,
      user: user,
      id: user.id,
      role: user.role
    };
  },

  // Registro simulado
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    specialty: string;
  }) {
    await delay(1500);
    
    // Verificar si el email ya existe
    if (mockUsers.find(u => u.email === userData.email)) {
      throw new Error('El email ya está registrado');
    }
    
    const newUser: MockUser = {
      id: (mockUsers.length + 1).toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'student',
      specialty: userData.specialty,
      aura: 0,
      ranking: mockUsers.length + 1,
      coursesCompleted: 0,
      hoursStudied: 0,
      memberSince: new Date().toISOString().split('T')[0]
    };
    
    mockUsers.push(newUser);
    
    return {
      success: true,
      message: 'Usuario registrado exitosamente'
    };
  },

  // Obtener perfil de usuario
  async getUserProfile(userId: string) {
    await delay(500);
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    return {
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      specialty: user.specialty,
      aura: user.aura,
      ranking: user.ranking,
      courses_completed: user.coursesCompleted,
      hours_studied: user.hoursStudied,
      member_since: user.memberSince
    };
  },

  // Obtener cursos del estudiante
  async getStudentCourses() {
    await delay(800);
    return mockCourses;
  },

  // Obtener cursos del profesor
  async getTeacherCourses() {
    await delay(800);
    return mockCourses.map(course => ({
      ...course,
      students: [
        {
          student_id: '1',
          student_name: 'Ana García',
          completed: course.progress === 100,
          merit_points: Math.floor(Math.random() * 100)
        },
        {
          student_id: '2',
          student_name: 'Luis Martínez',
          completed: Math.random() > 0.5,
          merit_points: Math.floor(Math.random() * 100)
        }
      ]
    }));
  },

  // Obtener ranking
  async getRanking(search: string = '') {
    await delay(600);
    
    const allUsers = [...mockUsers];
    const filteredUsers = search 
      ? allUsers.filter(user => 
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
        )
      : allUsers;
    
    const ranking = filteredUsers
      .sort((a, b) => b.aura - a.aura)
      .map((user, index) => ({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        specialty: user.specialty,
        aura: user.aura,
        rank: index + 1
      }));
    
    const currentUser = ranking.find(u => u.id === '1'); // Usuario actual por defecto
    
    return {
      ranking,
      user_rank: currentUser
    };
  },

  // Enviar formulario de contacto
  async submitContactForm(formData: any) {
    await delay(2000);
    
    console.log('Formulario de contacto enviado:', formData);
    
    return {
      success: true,
      message: 'Formulario enviado exitosamente'
    };
  }
};

// Utilidades para el localStorage
export const mockStorage = {
  setAuthData(loginResponse: any) {
    localStorage.setItem('accessToken', loginResponse.access);
    localStorage.setItem('refreshToken', loginResponse.refresh);
    localStorage.setItem('userId', loginResponse.id);
    localStorage.setItem('userRole', loginResponse.role);
  },

  clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }
};