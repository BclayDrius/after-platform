// Datos mock para cursos detallados

interface CourseWeek {
  week: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  lessons: number;
  duration: string;
  topics: string[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: string;
  progress: number;
  totalWeeks: number;
  weeks: CourseWeek[];
}

interface Lesson {
  id: number;
  title: string;
  type: 'video' | 'reading' | 'exercise' | 'quiz';
  duration: string;
  completed: boolean;
  description: string;
}

interface WeekData {
  week: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: Lesson[];
  resources: Array<{
    title: string;
    type: string;
    url: string;
  }>;
  assignment?: {
    title: string;
    description: string;
    dueDate: string;
  };
}

// Datos de cursos disponibles
const coursesData: Record<string, CourseData> = {
  javascript: {
    id: 'javascript',
    title: 'JavaScript Fundamentals',
    description: 'Aprende JavaScript desde cero hasta conceptos avanzados. Domina el lenguaje de programación más popular del mundo.',
    instructor: 'Dr. Ana García',
    level: 'Principiante a Intermedio',
    duration: '12 semanas',
    progress: 42,
    totalWeeks: 12,
    weeks: [
      {
        week: 1,
        title: 'Introducción a JavaScript',
        description: 'Conceptos básicos, sintaxis y primeros pasos en JavaScript.',
        status: 'completed',
        lessons: 5,
        duration: '3 horas',
        topics: ['Variables y tipos de datos', 'Operadores', 'Comentarios', 'Console.log', 'Debugging básico']
      },
      {
        week: 2,
        title: 'Estructuras de Control',
        description: 'Condicionales, bucles y control de flujo en JavaScript.',
        status: 'completed',
        lessons: 6,
        duration: '4 horas',
        topics: ['If/else statements', 'Switch cases', 'For loops', 'While loops', 'Break y continue']
      },
      {
        week: 3,
        title: 'Funciones',
        description: 'Declaración, expresiones y arrow functions.',
        status: 'completed',
        lessons: 7,
        duration: '4.5 horas',
        topics: ['Function declarations', 'Function expressions', 'Arrow functions', 'Parameters y arguments', 'Return statements']
      },
      {
        week: 4,
        title: 'Arrays y Objetos',
        description: 'Estructuras de datos fundamentales en JavaScript.',
        status: 'completed',
        lessons: 8,
        duration: '5 horas',
        topics: ['Array methods', 'Object properties', 'Destructuring', 'Spread operator', 'Rest parameters']
      },
      {
        week: 5,
        title: 'Scope y Closures',
        description: 'Comprende el alcance de variables y closures.',
        status: 'completed',
        lessons: 6,
        duration: '4 horas',
        topics: ['Global scope', 'Function scope', 'Block scope', 'Lexical scope', 'Closures']
      },
      {
        week: 6,
        title: 'DOM Manipulation',
        description: 'Interacción con el Document Object Model.',
        status: 'current',
        lessons: 9,
        duration: '6 horas',
        topics: ['Selecting elements', 'Event listeners', 'Creating elements', 'Modifying content', 'CSS manipulation']
      },
      {
        week: 7,
        title: 'Eventos y Event Handling',
        description: 'Manejo avanzado de eventos en el navegador.',
        status: 'locked',
        lessons: 7,
        duration: '5 horas',
        topics: ['Event types', 'Event bubbling', 'Event delegation', 'Custom events', 'Form handling']
      },
      {
        week: 8,
        title: 'Asynchronous JavaScript',
        description: 'Callbacks, Promises y async/await.',
        status: 'locked',
        lessons: 8,
        duration: '6 horas',
        topics: ['Callbacks', 'Promises', 'Async/await', 'Fetch API', 'Error handling']
      },
      {
        week: 9,
        title: 'ES6+ Features',
        description: 'Características modernas de JavaScript.',
        status: 'locked',
        lessons: 10,
        duration: '7 horas',
        topics: ['Template literals', 'Modules', 'Classes', 'Map y Set', 'Symbols']
      },
      {
        week: 10,
        title: 'Error Handling y Debugging',
        description: 'Técnicas para manejar errores y debugging.',
        status: 'locked',
        lessons: 6,
        duration: '4 horas',
        topics: ['Try/catch', 'Error types', 'Debugging tools', 'Console methods', 'Performance monitoring']
      },
      {
        week: 11,
        title: 'APIs y AJAX',
        description: 'Consumo de APIs y comunicación con servidores.',
        status: 'locked',
        lessons: 8,
        duration: '6 horas',
        topics: ['REST APIs', 'JSON', 'XMLHttpRequest', 'Fetch API', 'CORS']
      },
      {
        week: 12,
        title: 'Proyecto Final',
        description: 'Aplicación completa integrando todos los conceptos.',
        status: 'locked',
        lessons: 5,
        duration: '8 horas',
        topics: ['Project planning', 'Code organization', 'Testing', 'Deployment', 'Code review']
      }
    ]
  },
  react: {
    id: 'react',
    title: 'React Development',
    description: 'Construye aplicaciones web modernas con React. Desde componentes básicos hasta hooks avanzados.',
    instructor: 'Ing. Carlos Rodríguez',
    level: 'Intermedio',
    duration: '12 semanas',
    progress: 75,
    totalWeeks: 12,
    weeks: [
      {
        week: 1,
        title: 'Introducción a React',
        description: 'Conceptos fundamentales y configuración del entorno.',
        status: 'completed',
        lessons: 6,
        duration: '4 horas',
        topics: ['JSX', 'Components', 'Props', 'Create React App', 'Virtual DOM']
      },
      {
        week: 2,
        title: 'Estado y Eventos',
        description: 'Manejo de estado local y eventos en React.',
        status: 'completed',
        lessons: 7,
        duration: '5 horas',
        topics: ['useState Hook', 'Event handling', 'Controlled components', 'Forms', 'State updates']
      },
      {
        week: 3,
        title: 'Listas y Keys',
        description: 'Renderizado de listas y manejo de keys.',
        status: 'completed',
        lessons: 5,
        duration: '3.5 horas',
        topics: ['Map function', 'Keys', 'Conditional rendering', 'Lists optimization', 'Dynamic content']
      },
      {
        week: 4,
        title: 'Ciclo de Vida y useEffect',
        description: 'Efectos secundarios y ciclo de vida de componentes.',
        status: 'completed',
        lessons: 8,
        duration: '6 horas',
        topics: ['useEffect Hook', 'Cleanup functions', 'Dependencies array', 'Side effects', 'API calls']
      },
      {
        week: 5,
        title: 'Context API',
        description: 'Manejo de estado global con Context.',
        status: 'completed',
        lessons: 6,
        duration: '4.5 horas',
        topics: ['createContext', 'useContext', 'Provider pattern', 'Global state', 'Prop drilling']
      },
      {
        week: 6,
        title: 'React Router',
        description: 'Navegación y routing en aplicaciones React.',
        status: 'completed',
        lessons: 7,
        duration: '5 horas',
        topics: ['BrowserRouter', 'Routes', 'Navigation', 'URL parameters', 'Protected routes']
      },
      {
        week: 7,
        title: 'Hooks Avanzados',
        description: 'useReducer, useMemo, useCallback y custom hooks.',
        status: 'completed',
        lessons: 9,
        duration: '7 horas',
        topics: ['useReducer', 'useMemo', 'useCallback', 'Custom hooks', 'Performance optimization']
      },
      {
        week: 8,
        title: 'Formularios Avanzados',
        description: 'Validación y manejo complejo de formularios.',
        status: 'completed',
        lessons: 6,
        duration: '4.5 horas',
        topics: ['Form validation', 'Formik', 'Yup', 'Error handling', 'Dynamic forms']
      },
      {
        week: 9,
        title: 'Testing en React',
        description: 'Testing unitario y de integración.',
        status: 'completed',
        lessons: 8,
        duration: '6 horas',
        topics: ['Jest', 'React Testing Library', 'Unit tests', 'Integration tests', 'Mocking']
      },
      {
        week: 10,
        title: 'Optimización de Performance',
        description: 'Técnicas para optimizar aplicaciones React.',
        status: 'current',
        lessons: 7,
        duration: '5.5 horas',
        topics: ['React.memo', 'Code splitting', 'Lazy loading', 'Bundle optimization', 'Profiling']
      },
      {
        week: 11,
        title: 'Deployment y CI/CD',
        description: 'Despliegue y integración continua.',
        status: 'locked',
        lessons: 5,
        duration: '4 horas',
        topics: ['Build process', 'Netlify', 'Vercel', 'GitHub Actions', 'Environment variables']
      },
      {
        week: 12,
        title: 'Proyecto Final',
        description: 'Aplicación completa con todas las características.',
        status: 'locked',
        lessons: 6,
        duration: '10 horas',
        topics: ['Project architecture', 'State management', 'API integration', 'Testing', 'Deployment']
      }
    ]
  },
  nodejs: {
    id: 'nodejs',
    title: 'Node.js Backend Development',
    description: 'Desarrolla APIs robustas y escalables con Node.js y Express.',
    instructor: 'Dr. María López',
    level: 'Intermedio a Avanzado',
    duration: '12 semanas',
    progress: 0,
    totalWeeks: 12,
    weeks: [
      {
        week: 1,
        title: 'Introducción a Node.js',
        description: 'Fundamentos de Node.js y el ecosistema.',
        status: 'current',
        lessons: 6,
        duration: '4 horas',
        topics: ['Event loop', 'Modules', 'NPM', 'File system', 'Path module']
      },
      {
        week: 2,
        title: 'Express.js Fundamentals',
        description: 'Framework web para Node.js.',
        status: 'locked',
        lessons: 8,
        duration: '6 horas',
        topics: ['Routing', 'Middleware', 'Request/Response', 'Static files', 'Template engines']
      },
      // ... más semanas
      {
        week: 12,
        title: 'Microservicios y Deployment',
        description: 'Arquitectura de microservicios y despliegue.',
        status: 'locked',
        lessons: 7,
        duration: '8 horas',
        topics: ['Microservices', 'Docker', 'Kubernetes', 'Load balancing', 'Monitoring']
      }
    ]
  }
};

// Datos detallados de semanas
const weekContentData: Record<string, Record<number, WeekData>> = {
  javascript: {
    1: {
      week: 1,
      title: 'Introducción a JavaScript',
      description: 'En esta primera semana, aprenderás los conceptos fundamentales de JavaScript, incluyendo variables, tipos de datos y operadores básicos.',
      objectives: [
        'Comprender qué es JavaScript y su papel en el desarrollo web',
        'Aprender a declarar variables usando let, const y var',
        'Conocer los diferentes tipos de datos primitivos',
        'Utilizar operadores aritméticos, de comparación y lógicos',
        'Escribir tu primer programa en JavaScript'
      ],
      lessons: [
        {
          id: 1,
          title: '¿Qué es JavaScript?',
          type: 'video',
          duration: '15 min',
          completed: true,
          description: 'Introducción al lenguaje de programación más popular del mundo.'
        },
        {
          id: 2,
          title: 'Variables y Declaraciones',
          type: 'video',
          duration: '25 min',
          completed: true,
          description: 'Aprende a declarar variables con let, const y var.'
        },
        {
          id: 3,
          title: 'Tipos de Datos Primitivos',
          type: 'reading',
          duration: '20 min',
          completed: true,
          description: 'Explora string, number, boolean, undefined y null.'
        },
        {
          id: 4,
          title: 'Operadores en JavaScript',
          type: 'exercise',
          duration: '30 min',
          completed: false,
          description: 'Practica con operadores aritméticos y de comparación.'
        },
        {
          id: 5,
          title: 'Quiz: Fundamentos Básicos',
          type: 'quiz',
          duration: '10 min',
          completed: false,
          description: 'Evalúa tu comprensión de los conceptos básicos.'
        }
      ],
      resources: [
        {
          title: 'MDN JavaScript Guide',
          type: 'link',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'
        },
        {
          title: 'JavaScript Cheat Sheet',
          type: 'pdf',
          url: '/resources/js-cheatsheet.pdf'
        },
        {
          title: 'VS Code Setup Guide',
          type: 'tool',
          url: '/resources/vscode-setup'
        }
      ],
      assignment: {
        title: 'Calculadora Básica',
        description: 'Crea una calculadora simple que pueda realizar operaciones básicas (suma, resta, multiplicación, división) usando variables y operadores.',
        dueDate: '2024-02-15'
      }
    },
    6: {
      week: 6,
      title: 'DOM Manipulation',
      description: 'Aprende a interactuar con el Document Object Model para crear páginas web dinámicas e interactivas.',
      objectives: [
        'Entender qué es el DOM y cómo funciona',
        'Seleccionar elementos del DOM usando diferentes métodos',
        'Modificar contenido, atributos y estilos de elementos',
        'Crear y eliminar elementos dinámicamente',
        'Manejar eventos básicos del usuario'
      ],
      lessons: [
        {
          id: 1,
          title: 'Introducción al DOM',
          type: 'video',
          duration: '20 min',
          completed: true,
          description: 'Comprende la estructura del Document Object Model.'
        },
        {
          id: 2,
          title: 'Seleccionando Elementos',
          type: 'video',
          duration: '25 min',
          completed: true,
          description: 'getElementById, querySelector y más métodos de selección.'
        },
        {
          id: 3,
          title: 'Modificando Contenido',
          type: 'exercise',
          duration: '35 min',
          completed: false,
          description: 'Cambia texto, HTML y atributos de elementos.'
        },
        {
          id: 4,
          title: 'Estilos CSS con JavaScript',
          type: 'exercise',
          duration: '30 min',
          completed: false,
          description: 'Modifica estilos CSS usando JavaScript.'
        },
        {
          id: 5,
          title: 'Creando Elementos',
          type: 'video',
          duration: '20 min',
          completed: false,
          description: 'createElement, appendChild y manipulación dinámica.'
        },
        {
          id: 6,
          title: 'Event Listeners Básicos',
          type: 'exercise',
          duration: '40 min',
          completed: false,
          description: 'Responde a clicks, cambios y otros eventos.'
        },
        {
          id: 7,
          title: 'Proyecto: Lista de Tareas',
          type: 'exercise',
          duration: '60 min',
          completed: false,
          description: 'Construye una aplicación de lista de tareas interactiva.'
        },
        {
          id: 8,
          title: 'Debugging DOM Issues',
          type: 'reading',
          duration: '15 min',
          completed: false,
          description: 'Técnicas para debuggear problemas del DOM.'
        },
        {
          id: 9,
          title: 'Quiz: DOM Manipulation',
          type: 'quiz',
          duration: '15 min',
          completed: false,
          description: 'Evalúa tu conocimiento sobre manipulación del DOM.'
        }
      ],
      resources: [
        {
          title: 'DOM API Reference',
          type: 'link',
          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model'
        },
        {
          title: 'Chrome DevTools Guide',
          type: 'tool',
          url: '/resources/devtools-guide'
        },
        {
          title: 'DOM Manipulation Examples',
          type: 'pdf',
          url: '/resources/dom-examples.pdf'
        }
      ],
      assignment: {
        title: 'Galería de Imágenes Interactiva',
        description: 'Crea una galería de imágenes donde los usuarios puedan navegar entre fotos, ver detalles y filtrar por categorías usando manipulación del DOM.',
        dueDate: '2024-03-22'
      }
    }
  }
};

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockCourseService = {
  async getCourseById(courseId: string): Promise<CourseData> {
    await delay(800);
    
    const course = coursesData[courseId];
    if (!course) {
      throw new Error('Curso no encontrado');
    }
    
    return course;
  },

  async getWeekContent(courseId: string, weekId: number): Promise<WeekData> {
    await delay(600);
    
    const courseWeeks = weekContentData[courseId];
    if (!courseWeeks) {
      throw new Error('Curso no encontrado');
    }
    
    const weekData = courseWeeks[weekId];
    if (!weekData) {
      // Generar contenido genérico para semanas no definidas
      const course = coursesData[courseId];
      const weekInfo = course?.weeks.find(w => w.week === weekId);
      
      if (!weekInfo) {
        throw new Error('Semana no encontrada');
      }
      
      return {
        week: weekId,
        title: weekInfo.title,
        description: weekInfo.description,
        objectives: [
          `Dominar los conceptos clave de ${weekInfo.title}`,
          `Aplicar ${weekInfo.topics[0]} en proyectos prácticos`,
          `Resolver problemas comunes relacionados con ${weekInfo.topics[1] || 'el tema'}`,
          `Integrar conocimientos previos con nuevos conceptos`
        ],
        lessons: Array.from({ length: weekInfo.lessons }, (_, i) => ({
          id: i + 1,
          title: `Lección ${i + 1}: ${weekInfo.topics[i] || `Tema ${i + 1}`}`,
          type: ['video', 'reading', 'exercise', 'quiz'][i % 4] as any,
          duration: `${15 + (i * 5)} min`,
          completed: weekInfo.status === 'completed' ? Math.random() > 0.3 : false,
          description: `Aprende sobre ${weekInfo.topics[i] || `conceptos importantes de ${weekInfo.title}`}.`
        })),
        resources: [
          {
            title: `Documentación de ${weekInfo.title}`,
            type: 'link',
            url: '#'
          },
          {
            title: `Guía de ${weekInfo.title}`,
            type: 'pdf',
            url: '#'
          }
        ],
        assignment: weekId % 3 === 0 ? {
          title: `Proyecto: ${weekInfo.title}`,
          description: `Desarrolla un proyecto práctico aplicando los conceptos de ${weekInfo.title}.`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : undefined
      };
    }
    
    return weekData;
  },

  async getAllCourses(): Promise<CourseData[]> {
    await delay(500);
    return Object.values(coursesData);
  }
};