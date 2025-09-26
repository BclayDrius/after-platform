-- ============================================================================
-- DATOS DE EJEMPLO SIMPLES PARA AFTER LIFE ACADEMY
-- ============================================================================
-- Este script funciona con usuarios reales de Supabase Auth

-- ============================================================================
-- PASO 1: ACTUALIZAR USUARIO EXISTENTE COMO ADMIN
-- ============================================================================

-- Convertir el primer usuario encontrado en admin
UPDATE public.users 
SET 
    role = 'admin',
    first_name = 'Admin',
    last_name = 'Principal',
    specialty = 'Administración de Plataforma',
    aura = 1500,
    bio = 'Administrador principal de After Life Academy'
WHERE id = (
    SELECT id FROM public.users 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- ============================================================================
-- PASO 2: CREAR USUARIOS ADICIONALES (SOLO SI NO EXISTEN)
-- ============================================================================

-- Crear profesores ficticios (estos son solo para demostración)
-- En producción, los profesores se registrarían normalmente

DO $$
DECLARE
    admin_id UUID;
    teacher1_id UUID := gen_random_uuid();
    teacher2_id UUID := gen_random_uuid();
    student1_id UUID := gen_random_uuid();
    student2_id UUID := gen_random_uuid();
    student3_id UUID := gen_random_uuid();
BEGIN
    -- Obtener el ID del admin
    SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
    
    -- Insertar usuarios ficticios (solo para demo - en producción usar Supabase Auth)
    INSERT INTO public.users (id, email, first_name, last_name, role, specialty, aura, bio, is_active) VALUES
    (teacher1_id, 'carlos.rodriguez@demo.com', 'Carlos', 'Rodríguez', 'teacher', 'Desarrollo Web Full Stack', 1200, 'Profesor de desarrollo web con 8 años de experiencia', true),
    (teacher2_id, 'ana.garcia@demo.com', 'Ana', 'García', 'teacher', 'Data Science & AI', 1100, 'Especialista en ciencia de datos y machine learning', true),
    (student1_id, 'sofia.hernandez@demo.com', 'Sofía', 'Hernández', 'student', 'Frontend Development', 850, 'Estudiante apasionada por el desarrollo frontend', true),
    (student2_id, 'diego.lopez@demo.com', 'Diego', 'López', 'student', 'Backend Development', 720, 'Desarrollador junior enfocado en backend', true),
    (student3_id, 'camila.torres@demo.com', 'Camila', 'Torres', 'student', 'Data Science', 650, 'Analista de datos en transición a Data Science', true)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================================================
    -- PASO 3: CREAR CURSOS
    -- ============================================================================
    
    -- Curso 1: Desarrollo Web Fundamentals
    INSERT INTO public.courses (id, title, description, creator_id, level, duration_weeks, is_active, max_students, current_students) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Desarrollo Web Fundamentals', 'Aprende los fundamentos del desarrollo web moderno con HTML, CSS, JavaScript y React.', teacher1_id, 'beginner', 12, true, 30, 3);
    
    -- Curso 2: Data Science con Python
    INSERT INTO public.courses (id, title, description, creator_id, level, duration_weeks, is_active, max_students, current_students) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Data Science con Python', 'Aprende análisis de datos, machine learning y visualización con Python.', teacher2_id, 'intermediate', 12, true, 25, 2);
    
    -- Curso 3: JavaScript Avanzado
    INSERT INTO public.courses (id, title, description, creator_id, level, duration_weeks, is_active, max_students, current_students) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'JavaScript Avanzado', 'Domina conceptos avanzados de JavaScript y patrones de diseño.', teacher1_id, 'advanced', 12, true, 20, 1);

    -- ============================================================================
    -- PASO 4: CREAR INSTRUCTORES
    -- ============================================================================
    
    INSERT INTO public.course_instructors (course_id, instructor_id, role, added_by) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', teacher1_id, 'creator', teacher1_id),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', teacher2_id, 'creator', teacher2_id),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', teacher1_id, 'creator', teacher1_id),
    -- Ana como co-instructora en JavaScript Avanzado
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', teacher2_id, 'instructor', teacher1_id);

    -- ============================================================================
    -- PASO 5: CREAR SEMANAS PARA LOS CURSOS
    -- ============================================================================
    
    -- Crear 12 semanas para cada curso
    INSERT INTO public.course_weeks (course_id, week_number, title, description, is_locked, unlock_date)
    SELECT 
        course_id,
        week_number,
        'Semana ' || week_number || ': ' || title,
        description,
        CASE WHEN week_number = 1 THEN false ELSE true END,
        CASE WHEN week_number = 1 THEN CURRENT_DATE ELSE NULL END
    FROM (
        VALUES 
        -- Desarrollo Web Fundamentals
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'Introducción al Desarrollo Web', 'HTML, CSS y conceptos básicos'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 'CSS Avanzado y Layouts', 'Flexbox, Grid y diseño responsivo'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, 'JavaScript Fundamentals', 'Variables, funciones y DOM'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 'JavaScript Intermedio', 'Arrays, objetos y eventos'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'APIs y Fetch', 'Consumo de APIs REST'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 6, 'Introducción a React', 'Componentes y JSX'),
        -- Data Science con Python
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 'Python Básico', 'Sintaxis y estructuras de datos'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'NumPy y Pandas', 'Manipulación de datos'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, 'Visualización', 'Matplotlib y Seaborn'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, 'Machine Learning', 'Scikit-learn básico'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, 'Análisis Estadístico', 'Estadística descriptiva'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 6, 'Proyecto Final', 'Análisis completo de datos'),
        -- JavaScript Avanzado
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 'Closures y Scope', 'Conceptos avanzados de scope'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 2, 'Prototypes', 'Herencia prototípica'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 'Async/Await', 'Programación asíncrona'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 'Design Patterns', 'Patrones de diseño'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 5, 'Testing', 'Jest y testing unitario'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 6, 'Performance', 'Optimización de código')
    ) AS weeks_data(course_id, week_number, title, description)
    WHERE week_number <= 6;

    -- Crear semanas restantes (7-12) genéricas
    INSERT INTO public.course_weeks (course_id, week_number, title, description, is_locked)
    SELECT 
        c.id,
        generate_series(7, 12),
        'Semana ' || generate_series(7, 12),
        'Contenido avanzado de la semana ' || generate_series(7, 12),
        true
    FROM public.courses c;

    -- ============================================================================
    -- PASO 6: CREAR LECCIONES DE EJEMPLO
    -- ============================================================================
    
    -- Lecciones para la semana 1 de Desarrollo Web
    INSERT INTO public.lessons (week_id, title, description, type, duration_minutes, order_index, points_value)
    SELECT 
        cw.id,
        lesson_title,
        lesson_desc,
        lesson_type::VARCHAR(20),
        duration,
        order_num,
        10
    FROM public.course_weeks cw,
    (VALUES 
        ('¿Qué es el Desarrollo Web?', 'Introducción al desarrollo web moderno', 'video', 20, 1),
        ('HTML Básico', 'Elementos y estructura HTML', 'reading', 30, 2),
        ('CSS Fundamentals', 'Estilos y selectores CSS', 'video', 25, 3),
        ('Primer Ejercicio', 'Crea tu primera página', 'exercise', 45, 4),
        ('Quiz: Conceptos Básicos', 'Evaluación de conocimientos', 'quiz', 15, 5)
    ) AS lessons(lesson_title, lesson_desc, lesson_type, duration, order_num)
    WHERE cw.course_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND cw.week_number = 1;

    -- ============================================================================
    -- PASO 7: INSCRIPCIONES DE ESTUDIANTES
    -- ============================================================================
    
    -- Inscribir estudiantes en cursos
    INSERT INTO public.user_courses (user_id, course_id, enrolled_by, current_week, progress_percentage, status) VALUES
    (student1_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', teacher1_id, 2, 35, 'active'),
    (student2_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', teacher1_id, 1, 20, 'active'),
    (student3_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', teacher1_id, 1, 15, 'active'),
    (student1_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', teacher2_id, 1, 25, 'active'),
    (student3_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', teacher2_id, 2, 40, 'active'),
    (student1_id, 'cccccccc-cccc-cccc-cccc-cccccccccccc', teacher1_id, 1, 10, 'active');

    -- ============================================================================
    -- PASO 8: DESBLOQUEAR SEMANAS
    -- ============================================================================
    
    -- Desbloquear semana 1 para todos los estudiantes
    INSERT INTO public.user_week_unlocks (user_id, week_id, auto_unlocked)
    SELECT 
        uc.user_id,
        cw.id,
        true
    FROM public.user_courses uc
    JOIN public.course_weeks cw ON uc.course_id = cw.course_id
    WHERE cw.week_number = 1;

    -- Desbloquear semana 2 para estudiantes avanzados
    INSERT INTO public.user_week_unlocks (user_id, week_id, auto_unlocked)
    SELECT 
        uc.user_id,
        cw.id,
        true
    FROM public.user_courses uc
    JOIN public.course_weeks cw ON uc.course_id = cw.course_id
    WHERE cw.week_number = 2 AND uc.current_week >= 2;

    -- ============================================================================
    -- PASO 9: CREAR UNA TAREA DE EJEMPLO
    -- ============================================================================
    
    INSERT INTO public.assignments (week_id, title, description, instructions, due_date, max_points, created_by)
    SELECT 
        cw.id,
        'Mi Primera Página Web',
        'Crea una página web personal usando HTML y CSS',
        'Incluye: header, sección sobre ti, lista de hobbies, footer con contacto',
        CURRENT_DATE + INTERVAL '1 week',
        100,
        teacher1_id
    FROM public.course_weeks cw
    WHERE cw.course_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND cw.week_number = 1;

    -- ============================================================================
    -- PASO 10: ACTUALIZAR CONTADORES
    -- ============================================================================
    
    -- Actualizar total de lecciones
    UPDATE public.courses 
    SET total_lessons = (
        SELECT COUNT(l.id)
        FROM public.lessons l
        JOIN public.course_weeks cw ON l.week_id = cw.id
        WHERE cw.course_id = courses.id
    );

END $$;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT '🎉 DATOS DE EJEMPLO CREADOS EXITOSAMENTE! 🎉' as resultado;

SELECT 'Usuarios por rol:' as info;
SELECT role, COUNT(*) as cantidad 
FROM public.users 
GROUP BY role 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'teacher' THEN 2 
        WHEN 'student' THEN 3 
    END;

SELECT 'Cursos creados:' as info;
SELECT title, level, current_students || '/' || max_students as estudiantes
FROM public.courses 
ORDER BY created_at;

SELECT 'Inscripciones activas:' as info;
SELECT COUNT(*) as total FROM public.user_courses WHERE status = 'active';

SELECT '✅ Ahora puedes ir al Dashboard y probar el sistema!' as siguiente_paso;