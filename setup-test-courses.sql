-- ============================================================================
-- CREAR CURSOS BÁSICOS PARA PROBAR EL SISTEMA DE GESTIÓN DE CONTENIDO
-- ============================================================================
-- Este script crea cursos simples para que puedas probar todas las funcionalidades

-- ============================================================================
-- CURSO 1: DESARROLLO WEB BÁSICO
-- ============================================================================

INSERT INTO public.courses (
    id,
    title, 
    description, 
    creator_id, 
    level, 
    duration_weeks, 
    is_active, 
    max_students, 
    current_students,
    total_lessons
) VALUES (
    'curso-web-basico-2024',
    'Desarrollo Web Básico',
    'Aprende HTML, CSS y JavaScript desde cero. Perfecto para principiantes que quieren crear sus primeras páginas web.',
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5',
    'beginner',
    12,
    true,
    25,
    0,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ============================================================================
-- CURSO 2: JAVASCRIPT INTERMEDIO
-- ============================================================================

INSERT INTO public.courses (
    id,
    title, 
    description, 
    creator_id, 
    level, 
    duration_weeks, 
    is_active, 
    max_students, 
    current_students,
    total_lessons
) VALUES (
    'curso-js-intermedio-2024',
    'JavaScript Intermedio',
    'Domina JavaScript moderno: ES6+, APIs, programación asíncrona y proyectos prácticos.',
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5',
    'intermediate',
    12,
    true,
    20,
    0,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ============================================================================
-- CURSO 3: REACT FUNDAMENTALS
-- ============================================================================

INSERT INTO public.courses (
    id,
    title, 
    description, 
    creator_id, 
    level, 
    duration_weeks, 
    is_active, 
    max_students, 
    current_students,
    total_lessons
) VALUES (
    'curso-react-fundamentals-2024',
    'React Fundamentals',
    'Construye aplicaciones web modernas con React. Hooks, componentes, estado y más.',
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5',
    'intermediate',
    12,
    true,
    30,
    0,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ============================================================================
-- AGREGAR COMO INSTRUCTOR EN TODOS LOS CURSOS
-- ============================================================================

INSERT INTO public.course_instructors (course_id, instructor_id, role, added_by) VALUES
('curso-web-basico-2024', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5', 'creator', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5'),
('curso-js-intermedio-2024', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5', 'creator', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5'),
('curso-react-fundamentals-2024', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5', 'creator', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5')
ON CONFLICT (course_id, instructor_id) DO NOTHING;

-- ============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Cursos básicos creados exitosamente!';
    RAISE NOTICE '📚 Cursos disponibles:';
    RAISE NOTICE '   1. Desarrollo Web Básico (curso-web-basico-2024)';
    RAISE NOTICE '   2. JavaScript Intermedio (curso-js-intermedio-2024)';
    RAISE NOTICE '   3. React Fundamentals (curso-react-fundamentals-2024)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Próximos pasos:';
    RAISE NOTICE '   1. Inicia sesión como admin/teacher';
    RAISE NOTICE '   2. Ve a la sección de Cursos';
    RAISE NOTICE '   3. Haz clic en "📚 Gestionar Contenido" en cualquier curso';
    RAISE NOTICE '   4. Comienza a crear semanas, lecciones y tareas';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Funcionalidades disponibles:';
    RAISE NOTICE '   ✅ Crear hasta 12 semanas por curso';
    RAISE NOTICE '   ✅ Agregar lecciones (video, lectura, ejercicio, quiz)';
    RAISE NOTICE '   ✅ Crear tareas con fechas de entrega';
    RAISE NOTICE '   ✅ Control de permisos por rol';
    RAISE NOTICE '   ✅ Vista de solo lectura para estudiantes';
END $$;