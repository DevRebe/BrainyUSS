# Brainy USS — Plataforma Académica

Una plataforma web completa para estudiantes que permite gestionar apuntes de estudio, explorar la malla curricular y consultar a Brainy, un chatbot académico inteligente.

## 🎯 Características Principales

-### Gestión de Asignaturas y Apuntes
- **CRUD completo** de asignaturas organizadas por año y semestre
- **Subida de apuntes** en múltiples formatos (PDF, DOCX, TXT)
- **Biblioteca centralizada** con búsqueda y filtrado avanzado
- **Organización por malla curricular** de 5 años académicos

### Exploración Académica
- **Malla curricular interactiva** con vista por años y semestres
- **Exploración de asignaturas futuras** para planificación académica
- **Visualización del progreso** y estado de cada asignatura
- **Acceso anticipado** a apuntes de cursos avanzados

-### Chatbot Académico Inteligente (Brainy)
- **Integración con OpenAI GPT-4o-mini** para respuestas inteligentes
- **Sistema de embeddings** para consultas contextuales sobre apuntes
- **Interfaz de chat moderna** con historial de conversaciones
- **Respuestas basadas en contenido académico** específico de la universidad

### Sistema de Usuario
- **Autenticación segura** con Supabase Auth
- **Dashboard personalizado** con estadísticas y accesos rápidos
- **Gestión de sesiones** y perfiles de usuario
- **Roles y permisos** apropiados

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** + TypeScript para la interfaz de usuario
- **Tailwind CSS** para diseño responsive y tema oscuro
- **React Router** para navegación
- **Lucide React** para iconografía moderna
- **React Dropzone** para subida de archivos

### Backend y Base de Datos
- **Supabase** como backend completo (PostgreSQL + API + Auth + Storage)
- **Row Level Security (RLS)** para seguridad de datos
- **Políticas de acceso** granulares por tabla

### Inteligencia Artificial
- **OpenAI API** (GPT-4o-mini) para el chatbot
- **Text Embeddings** para búsqueda semántica
- **Procesamiento de lenguaje natural** aplicado a contenido académico

### Deploy y DevOps
- **Vite** como bundler para desarrollo rápido
- **Bolt Hosting** para deploy automático
- **Variables de entorno** para configuración segura

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Cuenta en Supabase
- API Key de OpenAI
- Git

### Configuración del Backend (Supabase)

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Anota la URL del proyecto y la clave anónima

2. **Configurar la base de datos:**
   ```bash
   # El archivo SQL se ejecutará automáticamente
   # Contiene todas las tablas, políticas y datos de ejemplo
   ```

3. **Configurar autenticación:**
   - En Supabase Dashboard > Authentication > Settings
   - Habilitar email confirmation = **false** (para desarrollo)
   - Configurar URLs permitidas si es necesario

### Configuración del Frontend

1. **Clonar e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

3. **Editar .env con tus credenciales:**
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   VITE_OPENAI_API_KEY=tu_api_key_de_openai
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## 📊 Estructura de la Base de Datos

### Tabla `subjects` (Asignaturas)
- Información de cada materia de la malla curricular
- Organizada por año (1-5) y semestre (1-2)
- Incluye prerrequisitos y descripción

### Tabla `materials` (Apuntes)
- Contenido académico subido por usuarios
- Vinculado a asignaturas específicas
- Soporte para múltiples tipos de archivo

### Tabla `chat_sessions` (Sesiones de Chat)
- Conversaciones con el chatbot académico
- Historial personalizado por usuario
- Almacenamiento JSON de mensajes

## 🎨 Diseño y UX

### Tema Oscuro Profesional
- **Colores principales:** Slate (grises) + Azul universitario
- **Contraste optimizado** para legibilidad
- **Micro-animaciones** y estados hover

### Diseño Responsive
- **Mobile-first** approach
- **Breakpoints adaptativos** para todas las pantallas
- **Navegación optimizada** en dispositivos móviles

### Componentes Reutilizables
- **Layout consistente** con sidebar de navegación
- **Modales** para formularios y detalles
- **Cards interactivos** para contenido
- **Estados de carga** y feedback visual

## 🤖 Funcionalidades del Chatbot

### Capacidades
- **Respuestas contextuales** basadas en apuntes subidos
- **Recomendaciones académicas** sobre prerequisitos y preparación
- **Búsqueda semántica** en contenido de asignaturas
- **Historial de conversaciones** persistente

### Ejemplos de Consultas
- "¿Qué necesito aprender para estar preparado para Inteligencia Artificial?"
- "¿Cuáles son los prerequisitos de Matemáticas Discretas?"
- "Explícame los conceptos básicos de programación"
- "¿Qué asignaturas me ayudarán a ser mejor desarrollador?"

## 📚 Datos de Ejemplo Incluidos

El sistema viene con una **malla curricular completa** de 5 años:

### Año 1: Fundamentos
- Introducción a la Programación, POO, Matemáticas Discretas
- Álgebra Lineal, Cálculo, Comunicación Efectiva

### Año 2: Estructuras Core
- Estructuras de Datos, Algoritmos, Base de Datos
- Arquitectura de Computadores, Estadística

### Año 3: Ingeniería de Software
- Ingeniería de Software, Redes, Sistemas Operativos
- Programación Web, Compiladores

### Año 4: Especialización
- Inteligencia Artificial, Seguridad Informática
- Computación Móvil, Cloud Computing, Proyecto de Título

### Año 5: Integración
- Taller de Integración, Seminario de Título
- Práctica Profesional, Trabajo de Título

## 🔒 Seguridad

### Row Level Security (RLS)
- **Políticas granulares** por tabla y operación
- **Aislamiento de datos** por usuario
- **Acceso público** a apuntes académicos (lectura)

### Autenticación
- **JWT tokens** gestionados por Supabase
- **Sesiones seguras** con renovación automática
- **Protección de rutas** en el frontend

### API Keys
- **Variables de entorno** para credenciales sensibles
- **Separación** entre desarrollo y producción
- **Rotación recomendada** de claves periódicamente

## 🚀 Deploy

### Desarrollo Local
```bash
npm run dev  # Puerto 5173 por defecto
```

### Build de Producción
```bash
npm run build  # Genera carpeta dist/
npm run preview  # Previsualizar build
```

### Deploy Automático
El proyecto está configurado para deploy automático en **Bolt Hosting** cuando se crean cambios en el código.

## 📈 Próximas Mejoras

### Funcionalidades Planeadas
- **Sistema de notificaciones** para nuevos apuntes
- **Colaboración entre estudiantes** con comentarios
- **Análisis de progreso** más detallado
- **Integración con calendario** académico
- **Sistema de badges** y gamificación

### Optimizaciones Técnicas
- **Cache** de embeddings para mejor performance
- **Compresión** de archivos subidos
- **Índices** de búsqueda full-text
- **API offline** con service workers

## 👥 Contribución

Este es un proyecto académico para la **Universidad San Sebastián**. Las contribuciones son bienvenidas siguiendo las mejores prácticas de desarrollo.

### Flujo de Desarrollo
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Proyecto académico desarrollado para la **Universidad San Sebastián**. 
Código disponible bajo licencia MIT para fines educativos.

---

**Desarrollado con ❤️ para la comunidad estudiantil de la Universidad San Sebastián**