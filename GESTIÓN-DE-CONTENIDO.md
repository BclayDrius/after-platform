# 📚 Sistema de Gestión de Contenido de Cursos

## 🎯 Funcionalidades Implementadas

### ✅ Control de Permisos por Rol

- **👑 Administradores**: Pueden crear, editar y eliminar todo el contenido de cualquier curso
- **👨‍🏫 Profesores**: Pueden gestionar completamente solo los cursos que ellos crearon
- **👨‍🎓 Estudiantes**: Solo pueden ver el contenido (modo solo lectura)

### ✅ Gestión de Semanas

- ➕ **Crear semanas**: Hasta máximo 12 semanas por curso
- ✏️ **Editar semanas**: Modificar título, descripción, objetivos y temas
- 🗑️ **Eliminar semanas**: Con confirmación y eliminación de todo el contenido
- 🔒 **Control de acceso**: Bloquear/desbloquear semanas con fechas
- 📋 **Objetivos y temas**: En formato JSON para máxima flexibilidad

### ✅ Gestión de Lecciones

- 📖 **Tipos de lección**: Video, Lectura, Ejercicio, Quiz, Tarea
- ⏱️ **Duración y puntos**: Control completo de tiempo y puntuación
- 📊 **Orden personalizable**: Reorganizar lecciones dentro de cada semana
- 🔗 **Contenido multimedia**: URLs y texto enriquecido
- ⚠️ **Lecciones obligatorias**: Marcar como requeridas

### ✅ Gestión de Tareas

- 📝 **Tipos de entrega**: Texto, Archivo, URL, o combinaciones
- 📅 **Fechas de entrega**: Control de plazos
- 🏆 **Sistema de puntos**: Puntuación personalizable
- 📋 **Instrucciones detalladas**: Guías paso a paso para estudiantes

## 🚀 Cómo Usar el Sistema

### 1. Configuración Inicial

```bash
# 1. Ejecuta el script SQL para crear cursos de prueba
# En tu cliente de Supabase, ejecuta:
setup-test-courses.sql
```

### 2. Acceso al Sistema

1. **Inicia sesión** como admin o teacher
2. Ve a la sección **"Cursos"**
3. Busca el botón **"📚 Gestionar Contenido"** en cualquier curso
4. ¡Comienza a crear contenido!

### 3. Flujo de Trabajo Recomendado

#### Paso 1: Crear la Estructura de Semanas

```
📅 Semanas (0/12) → ➕ Agregar Semana
├── Semana 1: Introducción
├── Semana 2: Conceptos Básicos
├── Semana 3: Práctica
└── ... (hasta 12 semanas máximo)
```

#### Paso 2: Agregar Contenido por Semana

```
📚 Contenido → Seleccionar Semana → ➕ Lección / ➕ Tarea
├── 📖 Lecciones
│   ├── 🎥 Video: Introducción (15 min, 10 pts)
│   ├── 📖 Lectura: Conceptos (20 min, 10 pts)
│   ├── 💻 Ejercicio: Práctica (30 min, 15 pts)
│   └── ❓ Quiz: Evaluación (10 min, 10 pts)
└── 📝 Tareas
    └── Proyecto Final (100 pts, fecha límite)
```

## 🎨 Interfaz de Usuario

### 📊 Vista de Resumen

- Progreso visual del curso (X/12 semanas)
- Estadísticas de lecciones y estudiantes
- Indicadores de estado y permisos

### 📅 Gestión de Semanas

- Lista visual de todas las semanas
- Estados: 🔒 Bloqueada / 🔓 Disponible
- Objetivos y temas organizados
- Botones de acción contextuales

### 📚 Editor de Contenido

- Panel lateral para selección de semanas
- Vista detallada de lecciones y tareas
- Formularios modales para creación/edición
- Validación en tiempo real

## 🔒 Sistema de Permisos

### Verificación de Acceso

```typescript
// Los permisos se verifican automáticamente
const canEdit = () => {
  if (currentUser.role === "admin") return true;
  if (currentUser.role === "teacher" && course?.creator_id === currentUser.id)
    return true;
  return false;
};
```

### Restricciones por Rol

| Acción           | Admin | Teacher (Propio) | Teacher (Ajeno) | Student |
| ---------------- | ----- | ---------------- | --------------- | ------- |
| Ver contenido    | ✅    | ✅               | ✅              | ✅      |
| Crear semanas    | ✅    | ✅               | ❌              | ❌      |
| Editar semanas   | ✅    | ✅               | ❌              | ❌      |
| Eliminar semanas | ✅    | ✅               | ❌              | ❌      |
| Crear lecciones  | ✅    | ✅               | ❌              | ❌      |
| Crear tareas     | ✅    | ✅               | ❌              | ❌      |

## 📋 Validaciones Implementadas

### ✅ Validación de Semanas

- Máximo 12 semanas por curso
- Números de semana únicos (1-12)
- Títulos obligatorios
- JSON válido para objetivos y temas

### ✅ Validación de Lecciones

- Títulos obligatorios
- Duración mínima de 1 minuto
- Puntos no negativos
- Orden único dentro de cada semana

### ✅ Validación de Tareas

- Títulos obligatorios
- Puntos máximos mayor a 0
- Fechas de entrega válidas

## 🎯 Próximas Mejoras Sugeridas

### 🔄 Funcionalidades Adicionales

- [ ] Arrastrar y soltar para reordenar lecciones
- [ ] Plantillas de semanas predefinidas
- [ ] Importar/exportar contenido de cursos
- [ ] Vista previa del contenido para estudiantes
- [ ] Estadísticas de progreso por semana

### 🎨 Mejoras de UX

- [ ] Modo oscuro
- [ ] Atajos de teclado
- [ ] Guardado automático
- [ ] Historial de cambios
- [ ] Colaboración en tiempo real

### 📊 Analytics

- [ ] Tiempo promedio por lección
- [ ] Tasa de completación por semana
- [ ] Puntuaciones promedio
- [ ] Feedback de estudiantes

## 🐛 Solución de Problemas

### Problema: No puedo crear semanas

**Solución**: Verifica que:

- Tengas permisos de admin o seas el creador del curso
- No hayas alcanzado el límite de 12 semanas
- El número de semana no esté duplicado

### Problema: Los objetivos no se guardan

**Solución**: Asegúrate de que el JSON sea válido:

```json
["Objetivo 1", "Objetivo 2", "Objetivo 3"]
```

### Problema: No veo el botón "Gestionar Contenido"

**Solución**:

- Solo admin y teachers ven este botón
- Los teachers solo lo ven en sus propios cursos

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, puedes:

1. Revisar este documento
2. Verificar los permisos de tu usuario
3. Consultar los logs del navegador (F12 → Console)
4. Contactar al equipo de desarrollo

---

**¡Disfruta creando contenido educativo increíble! 🚀📚**
