-- ============================================================================
-- CREAR CURSOS COMPLETOS PARA AFTER LIFE ACADEMY
-- ============================================================================

-- ============================================================================
-- CURSO 1: DESARROLLO WEB FUNDAMENTALS
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
    current_students
) VALUES (
    'web-fundamentals-2024',
    'Desarrollo Web Fundamentals',
    'Aprende los fundamentos del desarrollo web moderno desde cero. HTML5, CSS3, JavaScript ES6+, y tu primera aplicación web interactiva. Perfecto para principiantes que quieren entrar al mundo del desarrollo.',
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5',
    'beginner',
    12,
    true,
    25,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ============================================================================
-- CURSO 2: JAVASCRIPT AVANZADO
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
    current_students
) VALUES (
    'javascript-advanced-2024',
    'JavaScript Avanzado y Moderno',
    'Domina JavaScript moderno: ES6+, async/await, closures, prototypes, design patterns, testing y optimización. Incluye proyectos reales y mejores prácticas de la industria.',
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5',
    'advanced',
    12,
    true,
    20,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ============================================================================
-- CURSO 3: REACT DESDE CERO
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
    current_students
) VALUES (
    'react-from-zero-2024',
    'React desde Cero hasta Producción',
    'Construye aplicaciones web modernas con React. Hooks, Context API, React Router, testing, optimización y deployment. Incluye 3 proyectos completos y portfolio profesional.',
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5',
    'intermediate',
    12,
    true,
    30,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ============================================================================
-- CURSO 4: NODE.JS Y BACKEND
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
    current_students
) VALUES (
    'nodejs-backend-2024',
    'Node.js y Desarrollo Backend',
    'Desarrolla APIs robustas con Node.js, Express, MongoDB/PostgreSQL. Autenticación, seguridad, testing, deployment y arquitectura escalable. Proyecto: API completa para e-commerce.',
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5',
    'intermediate',
    12,
    true,
    25,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ============================================================================
-- AGREGAR COMO INSTRUCTOR EN TODOS LOS CURSOS
-- ============================================================================

INSERT INTO public.course_instructors (course_id, instructor_id, role, added_by) VALUES
('web-fundamentals-2024', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5', 'creator', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5'),
('javascript-advanced-2024', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5', 'creator', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5'),
('react-from-zero-2024', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5', 'creator', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5'),
('nodejs-backend-2024', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5', 'creator', 'c34d836c-4960-4521-86a8-cdbbdd8e82a5')
ON CONFLICT (course_id, instructor_id) DO NOTHING;

-- ============================================================================
-- CREAR SEMANAS DETALLADAS PARA DESARROLLO WEB FUNDAMENTALS
-- ============================================================================

INSERT INTO public.course_weeks (course_id, week_number, title, description, is_locked, unlock_date, objectives, topics) VALUES
('web-fundamentals-2024', 1, 'Introducción al Desarrollo Web', 'Fundamentos de la web, HTML5 semántico y herramientas de desarrollo', false, CURRENT_DATE, 
 '["Entender cómo funciona la web", "Configurar entorno de desarrollo", "Crear páginas HTML semánticas", "Usar herramientas de desarrollo"]',
 '["Historia de la web", "HTML5 semántico", "Estructura de documentos", "DevTools", "Editores de código"]'),

('web-fundamentals-2024', 2, 'CSS3 y Diseño Visual', 'Estilos, layouts, Flexbox y diseño responsivo', true, NULL,
 '["Dominar selectores CSS", "Crear layouts con Flexbox", "Implementar diseño responsivo", "Aplicar mejores prácticas de CSS"]',
 '["Selectores CSS", "Box Model", "Flexbox", "Media Queries", "CSS Grid básico"]'),

('web-fundamentals-2024', 3, 'JavaScript Fundamentals', 'Variables, funciones, eventos y manipulación del DOM', true, NULL,
 '["Entender sintaxis de JavaScript", "Manipular elementos del DOM", "Manejar eventos del usuario", "Crear interactividad básica"]',
 '["Variables y tipos", "Funciones", "DOM manipulation", "Event listeners", "Condicionales y bucles"]'),

('web-fundamentals-2024', 4, 'JavaScript Intermedio', 'Arrays, objetos, APIs y programación asíncrona', true, NULL,
 '["Trabajar con arrays y objetos", "Consumir APIs REST", "Manejar asincronía básica", "Crear aplicaciones dinámicas"]',
 '["Arrays y métodos", "Objetos JavaScript", "Fetch API", "Promises básicas", "JSON"]'),

('web-fundamentals-2024', 5, 'Proyecto: Aplicación del Clima', 'Primera aplicación completa consumiendo API real', true, NULL,
 '["Integrar todos los conocimientos", "Consumir API externa", "Manejar errores", "Crear interfaz atractiva"]',
 '["API del clima", "Geolocalización", "Error handling", "UI/UX básico", "Responsive design"]'),

('web-fundamentals-2024', 6, 'Formularios y Validación', 'Formularios HTML5, validación y envío de datos', true, NULL,
 '["Crear formularios accesibles", "Implementar validación", "Manejar envío de datos", "Mejorar experiencia de usuario"]',
 '["Formularios HTML5", "Validación nativa", "JavaScript validation", "LocalStorage", "UX de formularios"]');

-- Crear semanas restantes (7-12) genéricas para Web Fundamentals
INSERT INTO public.course_weeks (course_id, week_number, title, description, is_locked) 
SELECT 
    'web-fundamentals-2024',
    week_num,
    CASE week_num
        WHEN 7 THEN 'Git y Control de Versiones'
        WHEN 8 THEN 'Introducción a Frameworks'
        WHEN 9 THEN 'Optimización y Performance'
        WHEN 10 THEN 'Deployment y Hosting'
        WHEN 11 THEN 'Proyecto Final - Parte 1'
        WHEN 12 THEN 'Proyecto Final - Presentación'
    END,
    'Contenido avanzado de la semana ' || week_num,
    true
FROM generate_series(7, 12) AS week_num;

-- ============================================================================
-- CREAR SEMANAS PARA JAVASCRIPT AVANZADO
-- ============================================================================

INSERT INTO public.course_weeks (course_id, week_number, title, description, is_locked, unlock_date, objectives, topics) VALUES
('javascript-advanced-2024', 1, 'ES6+ y JavaScript Moderno', 'Características modernas de JavaScript y mejores prácticas', false, CURRENT_DATE,
 '["Dominar ES6+ features", "Entender scope y hoisting", "Usar destructuring y spread", "Aplicar arrow functions correctamente"]',
 '["Let/const vs var", "Arrow functions", "Template literals", "Destructuring", "Spread/Rest operators"]'),

('javascript-advanced-2024', 2, 'Closures y Scope Avanzado', 'Conceptos avanzados de scope, closures y contexto', true, NULL,
 '["Entender lexical scope", "Dominar closures", "Manejar contexto (this)", "Crear módulos privados"]',
 '["Lexical scope", "Closures", "Context binding", "IIFE", "Module pattern"]'),

('javascript-advanced-2024', 3, 'Prototypes y POO', 'Programación orientada a objetos en JavaScript', true, NULL,
 '["Entender prototypal inheritance", "Crear jerarquías de objetos", "Usar clases ES6", "Implementar patrones OOP"]',
 '["Prototype chain", "Constructor functions", "ES6 Classes", "Inheritance", "Polymorphism"]'),

('javascript-advanced-2024', 4, 'Asynchronous JavaScript', 'Programación asíncrona avanzada y manejo de errores', true, NULL,
 '["Dominar Promises", "Usar async/await efectivamente", "Manejar errores async", "Optimizar operaciones concurrentes"]',
 '["Promises avanzadas", "Async/await", "Error handling", "Promise.all/race", "Concurrent operations"]');

-- Crear semanas restantes para JavaScript Avanzado
INSERT INTO public.course_weeks (course_id, week_number, title, description, is_locked) 
SELECT 
    'javascript-advanced-2024',
    week_num,
    CASE week_num
        WHEN 5 THEN 'Design Patterns en JavaScript'
        WHEN 6 THEN 'Testing y TDD'
        WHEN 7 THEN 'Performance y Optimización'
        WHEN 8 THEN 'Módulos y Bundling'
        WHEN 9 THEN 'APIs y WebSockets'
        WHEN 10 THEN 'Security Best Practices'
        WHEN 11 THEN 'Proyecto: Framework Propio'
        WHEN 12 THEN 'Deployment y CI/CD'
    END,
    'Contenido avanzado de la semana ' || week_num,
    true
FROM generate_series(5, 12) AS week_num;

-- ============================================================================
-- CREAR LECCIONES PARA SEMANA 1 DE WEB FUNDAMENTALS
-- ============================================================================

INSERT INTO public.lessons (week_id, title, description, type, duration_minutes, order_index, points_value, is_required) 
SELECT 
    cw.id,
    lesson_data.title,
    lesson_data.description,
    lesson_data.type::VARCHAR(20),
    lesson_data.duration,
    lesson_data.order_idx,
    lesson_data.points,
    lesson_data.required
FROM public.course_weeks cw
CROSS JOIN (VALUES 
    ('¿Qué es el Desarrollo Web?', 'Introducción al mundo del desarrollo web y sus oportunidades', 'video', 20, 1, 10, true),
    ('Historia y Evolución de la Web', 'Desde HTML básico hasta aplicaciones modernas', 'reading', 15, 2, 5, true),
    ('Configurando tu Entorno', 'Instalación de herramientas: VS Code, navegadores, extensiones', 'video', 25, 3, 10, true),
    ('HTML5 Semántico', 'Elementos semánticos y estructura correcta de documentos', 'reading', 30, 4, 10, true),
    ('Tu Primera Página Web', 'Ejercicio práctico: crear tu página personal', 'exercise', 45, 5, 20, true),
    ('Herramientas de Desarrollo', 'DevTools del navegador y debugging básico', 'video', 20, 6, 10, true),
    ('Quiz: Fundamentos Web', 'Evaluación de conceptos básicos', 'quiz', 15, 7, 15, true)
) AS lesson_data(title, description, type, duration, order_idx, points, required)
WHERE cw.course_id = 'web-fundamentals-2024' AND cw.week_number = 1;

-- ============================================================================
-- CREAR LECCIONES PARA SEMANA 1 DE JAVASCRIPT AVANZADO
-- ============================================================================

INSERT INTO public.lessons (week_id, title, description, type, duration_minutes, order_index, points_value, is_required) 
SELECT 
    cw.id,
    lesson_data.title,
    lesson_data.description,
    lesson_data.type::VARCHAR(20),
    lesson_data.duration,
    lesson_data.order_idx,
    lesson_data.points,
    lesson_data.required
FROM public.course_weeks cw
CROSS JOIN (VALUES 
    ('ES6+ Overview', 'Características modernas de JavaScript que debes conocer', 'video', 25, 1, 15, true),
    ('Let, Const vs Var', 'Diferencias y cuándo usar cada declaración', 'reading', 20, 2, 10, true),
    ('Arrow Functions Deep Dive', 'Sintaxis, contexto y casos de uso avanzados', 'video', 30, 3, 15, true),
    ('Template Literals y Tagged Templates', 'Strings modernos y funciones avanzadas', 'exercise', 25, 4, 15, true),
    ('Destructuring Patterns', 'Extracción de datos de arrays y objetos', 'exercise', 35, 5, 20, true),
    ('Spread y Rest Operators', 'Operadores de expansión y recolección', 'video', 20, 6, 10, true),
    ('Proyecto: Refactoring Legacy Code', 'Moderniza código JavaScript antiguo', 'exercise', 60, 7, 25, true)
) AS lesson_data(title, description, type, duration, order_idx, points, required)
WHERE cw.course_id = 'javascript-advanced-2024' AND cw.week_number = 1;

-- ============================================================================
-- CREAR TAREAS PARA LOS CURSOS
-- ============================================================================

-- Tarea para Web Fundamentals - Semana 1
INSERT INTO public.assignments (week_id, title, description, instructions, due_date, max_points, is_required, created_by)
SELECT 
    cw.id,
    'Mi Página Web Personal',
    'Crea tu primera página web personal usando HTML5 semántico',
    'Requisitos:
1. Usar elementos semánticos (header, nav, main, section, article, footer)
2. Incluir información personal (nombre, foto, biografía)
3. Agregar sección de habilidades o intereses
4. Incluir formulario de contacto básico
5. Validar HTML con W3C Validator
6. Subir a GitHub Pages o Netlify

Entrega: URL del sitio web + código en GitHub',
    CURRENT_DATE + INTERVAL '1 week',
    100,
    true,
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5'
FROM public.course_weeks cw
WHERE cw.course_id = 'web-fundamentals-2024' AND cw.week_number = 1;

-- Tarea para JavaScript Avanzado - Semana 1
INSERT INTO public.assignments (week_id, title, description, instructions, due_date, max_points, is_required, created_by)
SELECT 
    cw.id,
    'Modernización de Código Legacy',
    'Refactoriza código JavaScript antiguo usando ES6+',
    'Se te proporciona un archivo JavaScript con código ES5. Tu tarea:

1. Convertir var a let/const apropiadamente
2. Reemplazar functions con arrow functions donde sea apropiado
3. Usar template literals en lugar de concatenación
4. Implementar destructuring para extraer datos
5. Usar spread/rest operators donde sea beneficioso
6. Agregar comentarios explicando cada cambio

Criterios de evaluación:
- Correcta aplicación de ES6+ (40%)
- Mantenimiento de funcionalidad (30%)
- Calidad del código (20%)
- Documentación de cambios (10%)',
    CURRENT_DATE + INTERVAL '1 week',
    100,
    true,
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5'
FROM public.course_weeks cw
WHERE cw.course_id = 'javascript-advanced-2024' AND cw.week_number = 1;

-- ============================================================================
-- ACTUALIZAR CONTADORES DE LECCIONES
-- ============================================================================

UPDATE public.courses 
SET total_lessons = (
    SELECT COUNT(l.id)
    FROM public.lessons l
    JOIN public.course_weeks cw ON l.week_id = cw.id
    WHERE cw.course_id = courses.id
);

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT '🎉 CURSOS CREADOS EXITOSAMENTE! 🎉' as resultado;

SELECT 'Cursos disponibles:' as info;
SELECT 
    title,
    level,
    total_lessons || ' lecciones' as contenido,
    max_students || ' estudiantes máx' as capacidad,
    CASE is_active WHEN true THEN '✅ Activo' ELSE '❌ Inactivo' END as estado
FROM public.courses 
ORDER BY 
    CASE level 
        WHEN 'beginner' THEN 1 
        WHEN 'intermediate' THEN 2 
        WHEN 'advanced' THEN 3 
    END;

SELECT 'Semanas creadas:' as info;
SELECT 
    c.title,
    COUNT(cw.id) || ' semanas' as semanas_creadas
FROM public.courses c
LEFT JOIN public.course_weeks cw ON c.id = cw.course_id
GROUP BY c.id, c.title
ORDER BY c.title;

SELECT 'Lecciones creadas:' as info;
SELECT 
    c.title,
    COUNT(l.id) || ' lecciones' as lecciones_creadas
FROM public.courses c
LEFT JOIN public.course_weeks cw ON c.id = cw.course_id
LEFT JOIN public.lessons l ON cw.id = l.week_id
GROUP BY c.id, c.title
ORDER BY c.title;

SELECT '✅ Ve al Dashboard para gestionar tus cursos!' as siguiente_paso;