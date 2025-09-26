-- ============================================================================
-- SETUP DESPUÉS DE REGISTRARTE EN LA APLICACIÓN
-- ============================================================================
-- IMPORTANTE: Ejecuta esto DESPUÉS de registrarte en /register

-- ============================================================================
-- PASO 1: VERIFICAR QUE TIENES UN USUARIO
-- ============================================================================

-- Mostrar usuarios existentes
SELECT 'Usuarios actuales en el sistema:' as info;
SELECT id, email, first_name, last_name, role, created_at 
FROM public.users 
ORDER BY created_at;

-- ============================================================================
-- PASO 2: CONVERTIR TU USUARIO EN ADMIN
-- ============================================================================

-- Convertir el primer usuario (tú) en admin
UPDATE public.users 
SET 
    role = 'admin',
    specialty = 'Administración de Plataforma',
    aura = 1500,
    bio = 'Administrador principal de After Life Academy'
WHERE id = (
    SELECT id FROM public.users 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- ============================================================================
-- PASO 3: CREAR UN CURSO DE EJEMPLO
-- ============================================================================

-- Crear un curso básico para probar
INSERT INTO public.courses (
    id, 
    title, 
    description, 
    creator_id, 
    level, 
    duration_weeks, 
    is_active, 
    max_students, 
    current_students
) 
SELECT 
    gen_random_uuid(),
    'Mi Primer Curso de Prueba',
    'Este es un curso de ejemplo para probar el sistema de roles y funcionalidades.',
    u.id,
    'beginner',
    12,
    true,
    30,
    0
FROM public.users u 
WHERE u.role = 'admin'
LIMIT 1;

-- ============================================================================
-- PASO 4: CREAR SEMANAS PARA EL CURSO
-- ============================================================================

-- Crear 12 semanas para el curso
INSERT INTO public.course_weeks (course_id, week_number, title, description, is_locked, unlock_date)
SELECT 
    c.id,
    week_num,
    'Semana ' || week_num,
    'Contenido de la semana ' || week_num,
    CASE WHEN week_num = 1 THEN false ELSE true END,
    CASE WHEN week_num = 1 THEN CURRENT_DATE ELSE NULL END
FROM public.courses c
CROSS JOIN generate_series(1, 12) AS week_num
WHERE c.title = 'Mi Primer Curso de Prueba';

-- ============================================================================
-- PASO 5: AGREGAR COMO INSTRUCTOR
-- ============================================================================

-- Agregar el creador como instructor principal
INSERT INTO public.course_instructors (course_id, instructor_id, role, added_by)
SELECT 
    c.id,
    c.creator_id,
    'creator',
    c.creator_id
FROM public.courses c
WHERE c.title = 'Mi Primer Curso de Prueba';

-- ============================================================================
-- PASO 6: CREAR ALGUNAS LECCIONES DE EJEMPLO
-- ============================================================================

-- Crear lecciones para la semana 1
INSERT INTO public.lessons (week_id, title, description, type, duration_minutes, order_index, points_value)
SELECT 
    cw.id,
    lesson_data.title,
    lesson_data.description,
    lesson_data.type::VARCHAR(20),
    lesson_data.duration,
    lesson_data.order_idx,
    lesson_data.points
FROM public.course_weeks cw
CROSS JOIN (
    VALUES 
        ('Introducción al Curso', 'Bienvenida y objetivos del curso', 'video', 15, 1, 10),
        ('Conceptos Básicos', 'Fundamentos que necesitas saber', 'reading', 20, 2, 10),
        ('Primer Ejercicio', 'Práctica inicial', 'exercise', 30, 3, 20),
        ('Evaluación', 'Quiz de conocimientos básicos', 'quiz', 10, 4, 15)
) AS lesson_data(title, description, type, duration, order_idx, points)
WHERE cw.course_id IN (SELECT id FROM public.courses WHERE title = 'Mi Primer Curso de Prueba')
AND cw.week_number = 1;

-- ============================================================================
-- PASO 7: CREAR UNA TAREA
-- ============================================================================

-- Crear una tarea para la semana 1
INSERT INTO public.assignments (week_id, title, description, instructions, due_date, max_points, created_by)
SELECT 
    cw.id,
    'Tarea de Introducción',
    'Primera tarea del curso para familiarizarte con la plataforma',
    'Completa los siguientes pasos: 1) Lee el material de la semana, 2) Responde las preguntas de reflexión, 3) Sube tu respuesta en formato texto',
    CURRENT_DATE + INTERVAL '1 week',
    100,
    c.creator_id
FROM public.course_weeks cw
JOIN public.courses c ON cw.course_id = c.id
WHERE c.title = 'Mi Primer Curso de Prueba' AND cw.week_number = 1;

-- ============================================================================
-- PASO 8: ACTUALIZAR CONTADORES
-- ============================================================================

-- Actualizar total de lecciones
UPDATE public.courses 
SET total_lessons = (
    SELECT COUNT(l.id)
    FROM public.lessons l
    JOIN public.course_weeks cw ON l.week_id = cw.id
    WHERE cw.course_id = courses.id
)
WHERE title = 'Mi Primer Curso de Prueba';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT '🎉 SETUP COMPLETADO! 🎉' as resultado;

SELECT 'Tu información actualizada:' as info;
SELECT 
    first_name || ' ' || last_name as nombre,
    email,
    role,
    specialty,
    aura
FROM public.users 
WHERE role = 'admin';

SELECT 'Curso creado:' as info;
SELECT 
    title,
    level,
    total_lessons || ' lecciones' as contenido,
    max_students || ' estudiantes máximo' as capacidad
FROM public.courses 
WHERE title = 'Mi Primer Curso de Prueba';

SELECT 'Semanas creadas:' as info;
SELECT COUNT(*) || ' semanas' as total FROM public.course_weeks;

SELECT 'Lecciones creadas:' as info;
SELECT COUNT(*) || ' lecciones' as total FROM public.lessons;

SELECT '✅ Ahora ve al Dashboard (/dashboard) para probar el sistema!' as siguiente_paso;
SELECT '📚 Como admin puedes crear más cursos y gestionar usuarios' as tip;