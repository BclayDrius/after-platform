-- ============================================================================
-- AFTER LIFE ACADEMY - SETUP COMPLETO DESDE CERO
-- ============================================================================
-- Este script crea todo el sistema de roles desde cero
-- Ejecutar DESPUÉS de limpiar la base de datos

-- ============================================================================
-- PARTE 1: TABLA DE USUARIOS (EXTENDIDA)
-- ============================================================================

-- Tabla de usuarios que extiende auth.users de Supabase
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    specialty VARCHAR(100),
    aura INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    hours_studied INTEGER DEFAULT 0,
    bio TEXT,
    profile_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PARTE 2: SISTEMA DE CURSOS
-- ============================================================================

-- Tabla principal de cursos
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    level VARCHAR(50) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration_weeks INTEGER DEFAULT 12,
    total_lessons INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    max_students INTEGER DEFAULT 50,
    current_students INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de instructores por curso (para co-enseñanza)
CREATE TABLE public.course_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'instructor' CHECK (role IN ('creator', 'instructor', 'assistant')),
    added_by UUID REFERENCES public.users(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, instructor_id)
);

-- Semanas del curso (12 semanas fijas)
CREATE TABLE public.course_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objectives JSONB DEFAULT '[]'::jsonb,
    topics JSONB DEFAULT '[]'::jsonb,
    is_locked BOOLEAN DEFAULT TRUE,
    unlock_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, week_number)
);

-- Lecciones dentro de las semanas
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.course_weeks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'reading' CHECK (type IN ('video', 'reading', 'exercise', 'quiz', 'assignment')),
    duration_minutes INTEGER DEFAULT 30,
    content_url VARCHAR(500),
    content_text TEXT,
    order_index INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    points_value INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PARTE 3: INSCRIPCIONES Y PROGRESO
-- ============================================================================

-- Inscripciones de estudiantes a cursos
CREATE TABLE public.user_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enrolled_by UUID REFERENCES public.users(id),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 12),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'withdrawn')),
    completion_date TIMESTAMP,
    final_grade INTEGER CHECK (final_grade BETWEEN 0 AND 100),
    UNIQUE(user_id, course_id)
);

-- Progreso de lecciones por usuario
CREATE TABLE public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    time_spent_minutes INTEGER DEFAULT 0,
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    attempts INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- Desbloqueo de semanas por usuario
CREATE TABLE public.user_week_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    week_id UUID REFERENCES public.course_weeks(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlocked_by UUID REFERENCES public.users(id),
    auto_unlocked BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, week_id)
);

-- ============================================================================
-- PARTE 4: TAREAS Y EVALUACIONES
-- ============================================================================

-- Tareas por semana
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.course_weeks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    due_date TIMESTAMP,
    max_points INTEGER DEFAULT 100,
    submission_type VARCHAR(20) DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'url', 'both')),
    is_required BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entregas de tareas por estudiantes
CREATE TABLE public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    submission_text TEXT,
    submission_url VARCHAR(500),
    file_name VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade INTEGER CHECK (grade BETWEEN 0 AND 100),
    feedback TEXT,
    graded_at TIMESTAMP,
    graded_by UUID REFERENCES public.users(id),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
    UNIQUE(assignment_id, user_id)
);

-- ============================================================================
-- PARTE 5: SOLICITUDES DE RETIRO
-- ============================================================================

-- Solicitudes de retiro de cursos
CREATE TABLE public.course_withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT
);

-- ============================================================================
-- PARTE 6: ÍNDICES PARA RENDIMIENTO
-- ============================================================================

-- Índices para usuarios
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_active ON public.users(is_active);

-- Índices para cursos
CREATE INDEX idx_courses_creator ON public.courses(creator_id);
CREATE INDEX idx_courses_active ON public.courses(is_active);
CREATE INDEX idx_courses_level ON public.courses(level);

-- Índices para instructores
CREATE INDEX idx_course_instructors_course ON public.course_instructors(course_id);
CREATE INDEX idx_course_instructors_instructor ON public.course_instructors(instructor_id);

-- Índices para semanas y lecciones
CREATE INDEX idx_course_weeks_course ON public.course_weeks(course_id);
CREATE INDEX idx_course_weeks_number ON public.course_weeks(course_id, week_number);
CREATE INDEX idx_lessons_week ON public.lessons(week_id);
CREATE INDEX idx_lessons_order ON public.lessons(week_id, order_index);

-- Índices para inscripciones y progreso
CREATE INDEX idx_user_courses_user ON public.user_courses(user_id);
CREATE INDEX idx_user_courses_course ON public.user_courses(course_id);
CREATE INDEX idx_user_courses_status ON public.user_courses(status);
CREATE INDEX idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON public.user_lesson_progress(lesson_id);
CREATE INDEX idx_user_week_unlocks_user ON public.user_week_unlocks(user_id);
CREATE INDEX idx_user_week_unlocks_week ON public.user_week_unlocks(week_id);

-- Índices para tareas
CREATE INDEX idx_assignments_week ON public.assignments(week_id);
CREATE INDEX idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_user ON public.assignment_submissions(user_id);
CREATE INDEX idx_assignment_submissions_status ON public.assignment_submissions(status);

-- Índices para solicitudes de retiro
CREATE INDEX idx_withdrawal_requests_user ON public.course_withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_course ON public.course_withdrawal_requests(course_id);
CREATE INDEX idx_withdrawal_requests_status ON public.course_withdrawal_requests(status);

-- ============================================================================
-- PARTE 7: FUNCIONES AUXILIARES
-- ============================================================================

-- Función para verificar acceso a curso
CREATE OR REPLACE FUNCTION public.user_can_access_course(user_uuid UUID, course_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    is_enrolled BOOLEAN;
    is_instructor BOOLEAN;
BEGIN
    -- Obtener rol del usuario
    SELECT role INTO user_role FROM public.users WHERE id = user_uuid;
    
    -- Admin puede acceder a todo
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si es instructor del curso
    SELECT EXISTS(
        SELECT 1 FROM public.course_instructors 
        WHERE course_id = course_uuid AND instructor_id = user_uuid
    ) INTO is_instructor;
    
    IF is_instructor THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si está inscrito como estudiante
    SELECT EXISTS(
        SELECT 1 FROM public.user_courses 
        WHERE course_id = course_uuid AND user_id = user_uuid AND status = 'active'
    ) INTO is_enrolled;
    
    RETURN is_enrolled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos de gestión
CREATE OR REPLACE FUNCTION public.user_can_manage_course(user_uuid UUID, course_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    is_creator BOOLEAN;
    is_instructor BOOLEAN;
BEGIN
    -- Obtener rol del usuario
    SELECT role INTO user_role FROM public.users WHERE id = user_uuid;
    
    -- Admin puede gestionar todo
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si es creador
    SELECT EXISTS(
        SELECT 1 FROM public.courses 
        WHERE id = course_uuid AND creator_id = user_uuid
    ) INTO is_creator;
    
    IF is_creator THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si es instructor con permisos de gestión
    SELECT EXISTS(
        SELECT 1 FROM public.course_instructors 
        WHERE course_id = course_uuid AND instructor_id = user_uuid 
        AND role IN ('creator', 'instructor')
    ) INTO is_instructor;
    
    RETURN is_instructor;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar contador de estudiantes
CREATE OR REPLACE FUNCTION increment_course_students(course_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.courses 
    SET current_students = current_students + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para decrementar contador de estudiantes
CREATE OR REPLACE FUNCTION decrement_course_students(course_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.courses 
    SET current_students = GREATEST(current_students - 1, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PARTE 8: TRIGGER PARA USUARIOS NUEVOS
-- ============================================================================

-- Función para manejar usuarios nuevos de Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nuevo')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PARTE 9: HABILITAR ROW LEVEL SECURITY
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_week_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PARTE 10: POLÍTICAS DE SEGURIDAD
-- ============================================================================

-- Políticas para usuarios
CREATE POLICY "Users can read accessible data" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        (
            (SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher' AND
            EXISTS (
                SELECT 1 FROM public.user_courses uc
                JOIN public.course_instructors ci ON uc.course_id = ci.course_id
                WHERE uc.user_id = users.id AND ci.instructor_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (
        auth.uid() = id OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para cursos
CREATE POLICY "Courses are readable" ON public.courses
    FOR SELECT USING (
        is_active = true OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.course_instructors 
            WHERE course_id = courses.id AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can create courses" ON public.courses
    FOR INSERT WITH CHECK (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('teacher', 'admin')
    );

CREATE POLICY "Course managers can update" ON public.courses
    FOR UPDATE USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.course_instructors 
            WHERE course_id = courses.id AND instructor_id = auth.uid() 
            AND role IN ('creator', 'instructor')
        )
    );

-- Políticas para inscripciones
CREATE POLICY "User courses are readable by participants" ON public.user_courses
    FOR SELECT USING (
        user_id = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.course_instructors 
            WHERE course_id = user_courses.course_id AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Course managers can enroll students" ON public.user_courses
    FOR INSERT WITH CHECK (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        public.user_can_manage_course(auth.uid(), course_id)
    );

CREATE POLICY "Participants can update progress" ON public.user_courses
    FOR UPDATE USING (
        user_id = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        public.user_can_manage_course(auth.uid(), course_id)
    );

-- Políticas básicas para otras tablas (simplificadas)
CREATE POLICY "Course content readable by participants" ON public.course_weeks
    FOR SELECT USING (public.user_can_access_course(auth.uid(), course_id));

CREATE POLICY "Lessons readable by participants" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.course_weeks cw
            WHERE cw.id = lessons.week_id AND public.user_can_access_course(auth.uid(), cw.course_id)
        )
    );

CREATE POLICY "Students can request withdrawal" ON public.course_withdrawal_requests
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'student'
    );

CREATE POLICY "Withdrawal requests readable by involved parties" ON public.course_withdrawal_requests
    FOR SELECT USING (
        user_id = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        public.user_can_manage_course(auth.uid(), course_id)
    );

-- ============================================================================
-- PARTE 11: VISTAS ÚTILES
-- ============================================================================

-- Vista de ranking de estudiantes
CREATE VIEW public.user_rankings AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.specialty,
    u.aura,
    RANK() OVER (ORDER BY u.aura DESC) as rank
FROM public.users u
WHERE u.role = 'student' AND u.is_active = true
ORDER BY u.aura DESC;

-- Vista de resumen de cursos
CREATE VIEW public.course_summary AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.level,
    c.duration_weeks,
    c.current_students,
    c.max_students,
    u.first_name || ' ' || u.last_name as creator_name,
    c.created_at
FROM public.courses c
JOIN public.users u ON c.creator_id = u.id
WHERE c.is_active = true;

-- ============================================================================
-- PARTE 12: VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que todas las tablas se crearon
SELECT 'Tablas creadas:' as tipo, COUNT(*) as cantidad
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'courses', 'course_instructors', 'course_weeks', 'lessons',
    'user_courses', 'user_lesson_progress', 'user_week_unlocks',
    'assignments', 'assignment_submissions', 'course_withdrawal_requests'
);

-- Verificar funciones
SELECT 'Funciones creadas:' as tipo, COUNT(*) as cantidad
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
AND routine_name LIKE '%course%';

-- Verificar RLS habilitado
SELECT 'Tablas con RLS:' as tipo, COUNT(*) as cantidad
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Mensaje final
SELECT '🎉 SISTEMA DE ROLES CREADO EXITOSAMENTE 🎉' as resultado;
SELECT 'Ahora puedes usar roleService en tu aplicación' as siguiente_paso;