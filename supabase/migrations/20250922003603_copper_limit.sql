/*
  # Plataforma Académica Universidad San Sebastián - Schema Inicial

  Este archivo crea toda la estructura de base de datos necesaria para la plataforma académica:
  
  ## 1. Nuevas Tablas
  - `subjects` - Asignaturas de la malla curricular
    - `id` (uuid, primary key)
    - `name` (text) - Nombre de la asignatura
    - `code` (text) - Código de la asignatura (ej: INF101)
    - `semester` (integer) - Semestre (1 o 2)
    - `year` (integer) - Año académico (1-5)
    - `description` (text, opcional) - Descripción de la asignatura
    - `prerequisites` (text[], opcional) - Array de códigos de prerrequisitos
    - `created_at` (timestamptz)

  - `materials` - Materiales de estudio
    - `id` (uuid, primary key)
    - `title` (text) - Título del material
    - `content` (text) - Contenido del material
    - `file_path` (text, opcional) - Ruta del archivo subido
    - `file_type` (text) - Tipo de archivo
    - `subject_id` (uuid) - FK hacia subjects
    - `uploaded_by` (uuid) - FK hacia auth.users
    - `created_at` (timestamptz)

  - `chat_sessions` - Sesiones de chat con el bot
    - `id` (uuid, primary key)  
    - `user_id` (uuid) - FK hacia auth.users
    - `messages` (jsonb) - Array de mensajes del chat
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Seguridad
  - Se habilita RLS en todas las tablas
  - Políticas para que usuarios autenticados puedan leer y escribir sus propios datos
  - Políticas para materiales y asignaturas de acceso público para lectura
  
  ## 3. Datos de Ejemplo
  - Se insertan asignaturas de ejemplo para los 5 años de la carrera
  - Materiales de ejemplo para algunas asignaturas
*/

-- Crear tabla de asignaturas
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  year integer NOT NULL CHECK (year >= 1 AND year <= 5),
  description text,
  prerequisites text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de materiales
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  file_path text,
  file_type text NOT NULL DEFAULT 'text/plain',
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de sesiones de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para subjects (lectura pública, escritura para autenticados)
CREATE POLICY "Anyone can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert subjects"
  ON subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update subjects"
  ON subjects
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subjects"
  ON subjects
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para materials (lectura pública, escritura para autenticados)
CREATE POLICY "Anyone can read materials"
  ON materials
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert materials"
  ON materials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own materials"
  ON materials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own materials"
  ON materials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- Políticas para chat_sessions (solo el propietario)
CREATE POLICY "Users can read own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insertar datos de ejemplo - Malla curricular completa
INSERT INTO subjects (name, code, semester, year, description) VALUES
-- Año 1
('Introducción a la Programación', 'INF101', 1, 1, 'Fundamentos básicos de programación usando Python'),
('Matemáticas Discretas I', 'MAT101', 1, 1, 'Lógica, conjuntos, relaciones y funciones'),
('Álgebra Lineal', 'MAT102', 1, 1, 'Vectores, matrices y sistemas lineales'),
('Comunicación Efectiva', 'COM101', 1, 1, 'Desarrollo de habilidades comunicativas'),
('Introducción a la Ingeniería', 'ING101', 1, 1, 'Perspectiva general de la ingeniería informática'),

('Programación Orientada a Objetos', 'INF102', 2, 1, 'Conceptos de POO usando Java'),
('Matemáticas Discretas II', 'MAT103', 2, 1, 'Grafos, árboles y combinatoria'),
('Cálculo I', 'MAT104', 2, 1, 'Límites, derivadas e integrales'),
('Física I', 'FIS101', 2, 1, 'Mecánica clásica y ondas'),
('Inglés Técnico I', 'ING102', 2, 1, 'Inglés aplicado a la informática'),

-- Año 2
('Estructuras de Datos', 'INF201', 1, 2, 'Listas, pilas, colas, árboles y grafos'),
('Algoritmos y Complejidad', 'INF202', 1, 2, 'Análisis de algoritmos y técnicas de diseño'),
('Base de Datos I', 'INF203', 1, 2, 'Diseño relacional y SQL'),
('Cálculo II', 'MAT201', 1, 2, 'Integrales múltiples y ecuaciones diferenciales'),
('Estadística y Probabilidades', 'MAT202', 1, 2, 'Conceptos estadísticos aplicados'),

('Programación de Sistemas', 'INF204', 2, 2, 'Programación en C y sistemas operativos'),
('Base de Datos II', 'INF205', 2, 2, 'Administración y optimización de BD'),
('Arquitectura de Computadores', 'INF206', 2, 2, 'Hardware y arquitectura de sistemas'),
('Física II', 'FIS201', 2, 2, 'Electricidad y magnetismo'),
('Inglés Técnico II', 'ING201', 2, 2, 'Inglés avanzado para informática'),

-- Año 3
('Ingeniería de Software I', 'INF301', 1, 3, 'Metodologías de desarrollo de software'),
('Redes de Computadores', 'INF302', 1, 3, 'Protocolos de red y telecomunicaciones'),
('Sistemas Operativos', 'INF303', 1, 3, 'Gestión de procesos, memoria y archivos'),
('Investigación Operativa', 'MAT301', 1, 3, 'Optimización y programación lineal'),
('Ética Profesional', 'ETI301', 1, 3, 'Aspectos éticos en la informática'),

('Ingeniería de Software II', 'INF304', 2, 3, 'Arquitectura de software y patrones'),
('Programación Web', 'INF305', 2, 3, 'HTML, CSS, JavaScript y frameworks'),
('Compiladores', 'INF306', 2, 3, 'Teoría de lenguajes y compilación'),
('Economía para Ingenieros', 'ECO301', 2, 3, 'Principios económicos aplicados'),
('Metodología de la Investigación', 'INV301', 2, 3, 'Técnicas de investigación científica'),

-- Año 4
('Inteligencia Artificial', 'INF401', 1, 4, 'Algoritmos de IA y machine learning'),
('Seguridad Informática', 'INF402', 1, 4, 'Criptografía y seguridad de sistemas'),
('Proyecto de Título I', 'PRO401', 1, 4, 'Desarrollo del proyecto de grado'),
('Gestión de Proyectos', 'GES401', 1, 4, 'Planificación y control de proyectos'),
('Electivo I', 'ELE401', 1, 4, 'Asignatura electiva especializada'),

('Computación Móvil', 'INF403', 2, 4, 'Desarrollo de aplicaciones móviles'),
('Cloud Computing', 'INF404', 2, 4, 'Servicios en la nube y arquitecturas'),
('Proyecto de Título II', 'PRO402', 2, 4, 'Continuación del proyecto de grado'),
('Emprendimiento', 'EMP401', 2, 4, 'Creación y gestión de empresas tecnológicas'),
('Electivo II', 'ELE402', 2, 4, 'Segunda asignatura electiva'),

-- Año 5
('Taller de Integración', 'TAL501', 1, 5, 'Integración de conocimientos adquiridos'),
('Seminario de Título', 'SEM501', 1, 5, 'Presentación y defensa del proyecto'),
('Práctica Profesional', 'PRA501', 1, 5, 'Experiencia laboral supervisada'),
('Liderazgo y Gestión', 'LID501', 1, 5, 'Habilidades directivas y liderazgo'),
('Electivo III', 'ELE501', 1, 5, 'Tercera asignatura electiva'),

('Trabajo de Título', 'TIT501', 2, 5, 'Desarrollo final del proyecto de título'),
('Evaluación de Proyectos', 'EVA501', 2, 5, 'Análisis de viabilidad de proyectos'),
('Actualización Tecnológica', 'ACT501', 2, 5, 'Tendencias actuales en tecnología'),
('Responsabilidad Social', 'RSE501', 2, 5, 'Impacto social de la tecnología'),
('Electivo IV', 'ELE502', 2, 5, 'Cuarta asignatura electiva');

-- Insertar algunos materiales de ejemplo
DO $$
DECLARE
  inf101_id uuid;
  inf102_id uuid;
  inf201_id uuid;
  mat101_id uuid;
  inf401_id uuid;
BEGIN
  -- Obtener IDs de algunas asignaturas
  SELECT id INTO inf101_id FROM subjects WHERE code = 'INF101';
  SELECT id INTO inf102_id FROM subjects WHERE code = 'INF102';
  SELECT id INTO inf201_id FROM subjects WHERE code = 'INF201';
  SELECT id INTO mat101_id FROM subjects WHERE code = 'MAT101';
  SELECT id INTO inf401_id FROM subjects WHERE code = 'INF401';

  -- Insertar materiales de ejemplo (sin user_id específico por ahora)
  INSERT INTO materials (title, content, file_type, subject_id, uploaded_by) VALUES
  ('Introducción a Python - Conceptos Básicos', 
   'Python es un lenguaje de programación interpretado de alto nivel. Sus principales características son:

1. Sintaxis clara y legible
2. Tipado dinámico
3. Gestión automática de memoria
4. Gran biblioteca estándar

Variables en Python:
- No necesitan declaración de tipo
- Se crean al asignarles un valor
- Ejemplo: nombre = "Juan", edad = 20

Tipos de datos básicos:
- int: números enteros
- float: números decimales
- str: cadenas de texto
- bool: valores booleanos (True/False)
- list: listas ordenadas
- dict: diccionarios (clave-valor)

Operadores:
- Aritméticos: +, -, *, /, %, **
- Comparación: ==, !=, <, >, <=, >=
- Lógicos: and, or, not

Estructuras de control:
- if/elif/else para condiciones
- for y while para bucles
- break y continue para control de flujo

Funciones:
- Definidas con def nombre_funcion():
- Pueden recibir parámetros
- Pueden retornar valores
- Ejemplo: def saludar(nombre): return f"Hola {nombre}"

Este material cubre los fundamentos necesarios para comenzar a programar en Python.',
   'text/plain', inf101_id, '00000000-0000-0000-0000-000000000000'),

  ('POO en Java - Clases y Objetos',
   'Programación Orientada a Objetos en Java

La POO es un paradigma de programación que organiza el código en clases y objetos.

CONCEPTOS FUNDAMENTALES:

1. CLASE:
- Plantilla o molde para crear objetos
- Define atributos (variables) y métodos (funciones)
- Ejemplo:
```java
public class Persona {
    private String nombre;
    private int edad;
    
    public Persona(String nombre, int edad) {
        this.nombre = nombre;
        this.edad = edad;
    }
    
    public void saludar() {
        System.out.println("Hola, soy " + nombre);
    }
}
```

2. OBJETO:
- Instancia específica de una clase
- Tiene estado (valores de atributos) y comportamiento (métodos)
- Ejemplo: Persona juan = new Persona("Juan", 25);

3. ENCAPSULACIÓN:
- Ocultar detalles internos de implementación
- Usar modificadores de acceso: private, public, protected
- Métodos getter y setter para acceso controlado

4. HERENCIA:
- Crear nuevas clases basadas en clases existentes
- Palabra clave: extends
- La clase hija hereda atributos y métodos del padre

5. POLIMORFISMO:
- Un objeto puede tomar múltiples formas
- Sobrescritura de métodos (@Override)
- Interfaces para definir contratos

6. ABSTRACCIÓN:
- Mostrar solo funcionalidades esenciales
- Clases abstractas e interfaces
- Simplificar la complejidad

VENTAJAS DE POO:
- Código reutilizable
- Fácil mantenimiento
- Modelado natural del mundo real
- Mejor organización del código

PRINCIPIOS SOLID:
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation  
- Dependency Inversion',
   'text/plain', inf102_id, '00000000-0000-0000-0000-000000000000'),

  ('Estructuras de Datos - Listas y Árboles',
   'ESTRUCTURAS DE DATOS FUNDAMENTALES

Las estructuras de datos son formas de organizar y almacenar información para un acceso y modificación eficientes.

1. LISTAS ENLAZADAS:

Características:
- Elementos conectados mediante punteros
- Tamaño dinámico
- Inserción/eliminación eficiente en cualquier posición

Tipos:
- Simple: cada nodo apunta al siguiente
- Doble: nodos con punteros hacia adelante y atrás
- Circular: el último nodo apunta al primero

Complejidad:
- Acceso: O(n)
- Inserción: O(1) si se tiene referencia al nodo
- Búsqueda: O(n)
- Eliminación: O(1) con referencia

2. PILAS (STACK):
- Estructura LIFO (Last In, First Out)
- Operaciones principales: push, pop, peek
- Aplicaciones: llamadas recursivas, calculadoras, undo/redo
- Complejidad de operaciones: O(1)

3. COLAS (QUEUE):
- Estructura FIFO (First In, First Out)
- Operaciones: enqueue, dequeue, front
- Aplicaciones: sistemas de impresión, BFS, scheduling
- Complejidad de operaciones: O(1)

4. ÁRBOLES:

Árbol Binario:
- Cada nodo tiene máximo 2 hijos
- Recorridos: inorden, preorden, postorden
- Altura: distancia desde raíz hasta hoja más lejana

Árbol Binario de Búsqueda (BST):
- Hijo izquierdo < nodo < hijo derecho
- Búsqueda, inserción, eliminación: O(log n) promedio
- Peor caso: O(n) si está desbalanceado

Árboles Balanceados:
- AVL: diferencia de alturas ≤ 1
- Rojo-Negro: propiedades de color para balance
- B-Trees: para bases de datos y sistemas de archivos

5. GRAFOS:
- Conjunto de vértices conectados por aristas
- Dirigidos vs no dirigidos
- Ponderados vs no ponderados
- Representación: matriz de adyacencia, lista de adyacencia
- Algoritmos: DFS, BFS, Dijkstra, Floyd-Warshall

SELECCIÓN DE ESTRUCTURA:
- Considerar operaciones más frecuentes
- Requisitos de memoria
- Complejidad temporal necesaria
- Facilidad de implementación

ANÁLISIS DE COMPLEJIDAD:
- Temporal: tiempo de ejecución
- Espacial: memoria utilizada
- Notación Big O: O(1), O(log n), O(n), O(n log n), O(n²)

Cada estructura tiene sus ventajas según el caso de uso específico.',
   'text/plain', inf201_id, '00000000-0000-0000-0000-000000000000'),

  ('Lógica Proposicional - Fundamentos',
   'MATEMÁTICAS DISCRETAS - LÓGICA PROPOSICIONAL

La lógica proposicional es la base del razonamiento matemático y computacional.

1. PROPOSICIONES:
- Enunciados que pueden ser verdaderos o falsos
- No pueden ser ambos simultáneamente
- Ejemplos: "Hoy llueve", "2 + 2 = 4", "x > 5"

2. CONECTIVOS LÓGICOS:

Negación (¬):
- ¬p es verdadero si p es falso
- Tabla de verdad: T→F, F→T

Conjunción (∧):
- p ∧ q es verdadero solo si ambos son verdaderos
- Tabla: TT→T, TF→F, FT→F, FF→F

Disyunción (∨):
- p ∨ q es falso solo si ambos son falsos  
- Tabla: TT→T, TF→T, FT→T, FF→F

Implicación (→):
- p → q es falso solo cuando p es verdadero y q es falso
- Tabla: TT→T, TF→F, FT→T, FF→T

Bicondicional (↔):
- p ↔ q es verdadero cuando ambos tienen el mismo valor
- Tabla: TT→T, TF→F, FT→F, FF→T

3. LEYES DE LA LÓGICA:

Conmutativas:
- p ∧ q ≡ q ∧ p
- p ∨ q ≡ q ∨ p

Asociativas:
- (p ∧ q) ∧ r ≡ p ∧ (q ∧ r)
- (p ∨ q) ∨ r ≡ p ∨ (q ∨ r)

Distributivas:
- p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r)
- p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r)

De Morgan:
- ¬(p ∧ q) ≡ ¬p ∨ ¬q
- ¬(p ∨ q) ≡ ¬p ∧ ¬q

4. FORMAS NORMALES:

CNF (Conjunctive Normal Form):
- Conjunción de disyunciones
- Ejemplo: (p ∨ q) ∧ (¬p ∨ r) ∧ (q ∨ ¬r)

DNF (Disjunctive Normal Form):
- Disyunción de conjunciones
- Ejemplo: (p ∧ q) ∨ (¬p ∧ r) ∨ (q ∧ ¬r)

5. MÉTODOS DE DEMOSTRACIÓN:

Tabla de Verdad:
- Evaluar todas las combinaciones posibles
- Útil para fórmulas pequeñas

Equivalencia Lógica:
- Usando leyes conocidas
- Más eficiente para fórmulas complejas

Resolución:
- Método de refutación
- Convertir a CNF y buscar contradicciones

6. APLICACIONES EN COMPUTACIÓN:
- Circuitos digitales
- Bases de datos (consultas booleanas)
- Inteligencia artificial (sistemas expertos)
- Verificación de programas
- Algoritmos de satisfacibilidad (SAT)

La lógica proposicional proporciona la base formal para el razonamiento en ciencias de la computación.',
   'text/plain', mat101_id, '00000000-0000-0000-0000-000000000000'),

  ('Machine Learning - Conceptos Fundamentales',
   'INTELIGENCIA ARTIFICIAL - MACHINE LEARNING

El Machine Learning es una rama de la IA que permite a las máquinas aprender y mejorar automáticamente sin ser programadas explícitamente.

1. TIPOS DE APRENDIZAJE:

Aprendizaje Supervisado:
- Se entrena con datos etiquetados
- Objetivo: predecir etiquetas de nuevos datos
- Ejemplos: clasificación, regresión
- Algoritmos: regresión lineal, SVM, árboles de decisión, redes neuronales

Aprendizaje No Supervisado:
- Datos sin etiquetas
- Objetivo: encontrar patrones ocultos
- Ejemplos: clustering, reducción de dimensionalidad
- Algoritmos: K-means, PCA, autoencoders

Aprendizaje por Refuerzo:
- Agente aprende mediante recompensas/castigos
- Interacción con ambiente
- Ejemplos: juegos, robótica, control
- Algoritmos: Q-Learning, Policy Gradient

2. ALGORITMOS PRINCIPALES:

Regresión Lineal:
- Predice valores continuos
- Función: y = wx + b
- Minimiza error cuadrático medio

Regresión Logística:
- Clasificación binaria
- Función sigmoide para probabilidades
- Salida entre 0 y 1

Árboles de Decisión:
- Estructura de árbol con reglas
- Fácil interpretación
- Propenso a overfitting

Random Forest:
- Conjunto de árboles de decisión
- Mejor generalización
- Reduce overfitting

Support Vector Machines (SVM):
- Encuentra hiperplano óptimo de separación
- Funciona bien en altas dimensiones
- Kernel trick para datos no lineales

K-Means:
- Algoritmo de clustering
- Agrupa datos en k clusters
- Minimiza distancia intra-cluster

3. REDES NEURONALES:

Perceptrón:
- Unidad básica de procesamiento
- Función: salida = activación(Σ(wi * xi) + b)
- Funciones de activación: sigmoid, tanh, ReLU

Redes Multicapa:
- Capas ocultas entre entrada y salida
- Backpropagation para entrenamiento
- Capaces de aprender funciones no lineales

Deep Learning:
- Redes con muchas capas ocultas
- CNN para imágenes
- RNN para secuencias
- Transformers para lenguaje natural

4. PROCESO DE DESARROLLO:

Definición del Problema:
- Supervisado vs no supervisado
- Clasificación vs regresión
- Métricas de evaluación

Preparación de Datos:
- Limpieza de datos
- Manejo de valores faltantes
- Normalización/estandarización
- Feature engineering

División de Datos:
- Entrenamiento (70%)
- Validación (15%)
- Prueba (15%)

Entrenamiento:
- Selección de modelo
- Ajuste de hiperparámetros
- Validación cruzada

Evaluación:
- Métricas: precisión, recall, F1-score
- Matriz de confusión
- Curvas ROC

5. DESAFÍOS COMUNES:

Overfitting:
- Modelo muy complejo para los datos
- Soluciones: regularización, más datos, dropout

Underfitting:
- Modelo muy simple
- Soluciones: más features, modelo más complejo

Sesgo en Datos:
- Datos no representativos
- Importante consideración ética

Interpretabilidad:
- Modelos "caja negra"
- Trade-off con performance

6. HERRAMIENTAS:
- Python: scikit-learn, TensorFlow, PyTorch
- R: caret, randomForest
- Plataformas: Google Colab, Jupyter Notebooks
- Cloud: AWS SageMaker, Google AI Platform

El ML requiere combinar conocimientos técnicos, estadísticos y del dominio del problema.',
   'text/plain', inf401_id, '00000000-0000-0000-0000-000000000000');
END $$;