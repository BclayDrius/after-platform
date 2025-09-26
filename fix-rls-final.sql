-- ============================================================================
-- ARREGLO FINAL DE POLÍTICAS RLS - SIMPLE Y FUNCIONAL
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR FUNCIÓN is_admin CORRECTA
-- ============================================================================

-- Crear función que acepta UUID (recomendado por Supabase)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- También crear sobrecarga para TEXT por si acaso
CREATE OR REPLACE FUNCTION public.is_admin(user_id text)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id::uuid AND role = 'admin'
    );
END;
$$;

-- ============================================================================
-- PASO 2: PROBAR LA FUNCIÓN ANTES DE USARLA
-- ============================================================================

-- Probar que la función funciona
SELECT 'Probando función is_admin:' as test;
SELECT public.is_admin('c34d836c-4960-4521-86a8-cdbbdd8e82a5'::uuid) as test_result;

-- ============================================================================
-- PASO 3: ELIMINAR POLÍTICAS PROBLEMÁTICAS
-- ============================================================================

-- Eliminar políticas que causan recursión
DROP POLICY IF EXISTS "Users read policy" ON public.users;
DROP POLICY IF EXISTS "Users can read accessible data" ON public.users;
DROP POLICY IF EXISTS "users_read_safe" ON public.users;

-- ============================================================================
-- PASO 4: CREAR POLÍTICAS SIMPLES Y SEGURAS
-- ============================================================================

-- Política de lectura simple y segura
CREATE POLICY "users_select_simple" ON public.users
    FOR SELECT USING (
        -- Los usuarios pueden leer su propia información
        auth.uid()::uuid = id 
        OR 
        -- Los admins pueden leer todo (usando nuestra función segura)
        public.is_admin(auth.uid()::uuid)
    );

-- Política de actualización simple y segura  
DROP POLICY IF EXISTS "Users update policy" ON public.users;
DROP POLICY IF EXISTS "users_update_safe" ON public.users;

CREATE POLICY "users_update_simple" ON public.users
    FOR UPDATE USING (
        -- Los usuarios pueden actualizar su propia información
        auth.uid()::uuid = id 
        OR 
        -- Los admins pueden actualizar cualquier usuario
        public.is_admin(auth.uid()::uuid)
    );

-- La política de inserción ya existe y está bien
-- No la tocamos

-- ============================================================================
-- PASO 5: CONVERTIR TU USUARIO EN ADMIN
-- ============================================================================

-- Actualizar tu usuario para que sea admin
UPDATE public.users 
SET 
    role = 'admin',
    specialty = 'Administración de Plataforma',
    aura = 1500,
    bio = 'Administrador principal de After Life Academy',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'c34d836c-4960-4521-86a8-cdbbdd8e82a5';

-- ============================================================================
-- PASO 6: PROBAR QUE TODO FUNCIONA
-- ============================================================================

-- Probar que ahora puedes leer usuarios sin recursión
SELECT 'Probando lectura de usuarios:' as test;
SELECT id, first_name, last_name, role 
FROM public.users 
WHERE id = 'c34d836c-4960-4521-86a8-cdbbdd8e82a5';

-- ============================================================================
-- PASO 7: CREAR CURSO DE EJEMPLO
-- ============================================================================

-- Crear un curso simple para probar
INSERT INTO public.courses (
    title, 
    description, 
    creator_id, 
    level, 
    duration_weeks, 
    is_active, 
    max_students, 
    current_students
) VALUES (
    'Curso de Prueba - Sistema Funcionando',
    'Este curso confirma que el sistema de roles funciona correctamente.',
    'c34d836c-4960-4521-86a8-cdbbdd8e82a5',
    'beginner',
    12,
    true,
    30,
    0
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT '🎉 ARREGLO COMPLETADO! 🎉' as resultado;

SELECT 'Función is_admin creada:' as info;
SELECT public.is_admin('c34d836c-4960-4521-86a8-cdbbdd8e82a5'::uuid) as admin_check;

SELECT 'Tu información:' as info;
SELECT 
    first_name || ' ' || last_name as nombre,
    email,
    role,
    'Listo para usar ✅' as estado
FROM public.users 
WHERE id = 'c34d836c-4960-4521-86a8-cdbbdd8e82a5';

SELECT 'Políticas activas:' as info;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

SELECT '✅ Recarga el Dashboard - debería funcionar sin errores!' as siguiente_paso;