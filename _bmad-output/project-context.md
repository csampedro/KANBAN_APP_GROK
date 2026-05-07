# Contexto del Proyecto: Kanban con Cronómetro

Este documento centraliza las estrategias de diseño y desarrollo para transformar la aplicación de una herramienta funcional a un producto profesional con alta usabilidad.

## Brainstorming: Mejora del Look and Feel

### 1. Estética y Diseño Visual (UI)
- **Paleta de Colores Profesional:** Migrar de colores HTML estándar a un esquema basado en diseño moderno (ej. Slate para textos, Indigo para acentos, Emerald para éxitos).
    - Fondo general: `#f8f9fa` (Gris muy claro).
    - Columnas: Blancas con bordes muy finos o sombras suaves.
- **Tipografía y Jerarquía:** Implementar 'Inter' o 'System-UI' para una lectura técnica clara. Aumentar el contraste entre los títulos de columna y el contenido de las tareas.
- **Tarjetas de Tareas:**
    - **Elevación:** Uso de `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`.
    - **Bordes:** Redondeado moderno (`border-radius: 12px`).
    - **Indicador de Estado:** Una barra lateral de color de 4px que indique si la tarea está activa, pausada o completada.

### 2. Interactividad y Feedback (UX)
- **Drag and Drop (Arrastrar y Soltar):** Integrar `SortableJS` para eliminar la fricción de mover tareas manualmente con botones, permitiendo una gestión fluida entre columnas.
- **Micro-interacciones:**
    - **Efecto de Pulso:** Cuando el cronómetro está activo, la tarjeta debe tener un resplandor sutil (glow) o pulso en el borde para indicar "trabajo en progreso".
    - **Transiciones:** Suavizar la entrada y salida de tareas con `transition: all 0.2s ease-in-out`.
- **Feedback Inmediato:** Uso de Toasts (notificaciones efímeras) para confirmar acciones como "Tarea Guardada" o "Tiempo Registrado".

### 3. Funcionalidades de Interfaz Avanzadas
- **Modo Oscuro Dinámico:** Soporte nativo para temas oscuros utilizando variables CSS (`--bg-color`, `--card-color`).
- **Diseño Responsivo (Mobile First):** Optimizar la vista para móviles donde las columnas se conviertan en un carrusel o vista de pestañas, evitando el scroll horizontal infinito.
- **Visualización de Tiempo:** Añadir una pequeña gráfica de barras o progreso si la tarea tiene un tiempo objetivo (estimación vs. real).

### 4. Limpieza de Interfaz (Clean Code UI)
- **Kebab Menu (Opciones Ocultas):** Agrupar acciones secundarias (Editar, Regresar, Subir/Bajar) en un menú desplegable de "tres puntos" para reducir la carga cognitiva.
- **Empty States (Estados Vacíos):** Cuando una columna no tiene tareas, mostrar un mensaje motivador o un icono tenue en lugar de un espacio vacío.
- **Skeleton Screens:** Mostrar estructuras de carga mientras la aplicación inicializa los datos desde el almacenamiento.

---

## Implementación: Refactorización CSS y Sistema de Diseño

Se ha completado la fase 1 de modernización, migrando de estilos estáticos a un sistema dinámico basado en variables de CSS3.

### Detalles Técnicos del CSS
1.  **Variables de Tema (`:root`):**
    - **Paleta Slate & Indigo:** Se utiliza `Slate (#1e293b)` para la jerarquía de texto y `Indigo (#6366f1)` como color primario de acento.
    - **Feedback Semántico:** Uso de `Emerald (#10b981)` para estados de éxito (tareas seleccionadas/completadas) y `Amber` para advertencias.
    - **Centralización:** Los radios de borde (12px) y las sombras están estandarizados mediante variables para asegurar consistencia en toda la UI.

2.  **Arquitectura de Componentes:**
    - **Tarjetas (Cards):** Implementación de `border-left` de 4px para indicar visualmente el inicio de la tarjeta y su categoría.
    - **Botones de Icono (`.btn-icon`):** Estilo minimalista diseñado específicamente para albergar iconos de Lucide, con estados `:hover` que utilizan colores translúcidos para no sobrecargar la vista.

3.  **Micro-interacciones y Animaciones:**
    - **Efecto de Elevación:** Las tareas utilizan `transform: translateY(-2px)` al hacer hover para proporcionar una sensación táctil de interactividad.
    - **Pulse Animation:** La tarea activa (en cronómetro) utiliza una animación de "anillo de pulso" en el borde (`pulse-border`) para comunicar que hay un proceso de fondo ejecutándose sin necesidad de leer el tiempo.

4.  **Layout y Responsividad:**
    - Migración total a **Flexbox** para las columnas, permitiendo que el tablero se ajuste dinámicamente (`flex-wrap`) en pantallas más pequeñas.

### Notificaciones (Toasts)
Se integró un sistema de notificaciones efímeras inyectadas mediante JavaScript pero estilizadas con CSS moderno, utilizando `animation: slideIn` para una entrada suave desde la esquina inferior derecha.

---

## Estado de los Próximos Pasos

| Paso | Estado | Descripción |
| :--- | :--- | :--- |
| **1. Refactorización de Estilos** | ✅ Completado | Sistema de variables `:root` e Inter UI implementado. |
| **2. Iconografía** | ✅ Completado | Migración de botones de texto a Lucide Icons. |
| **3. Notificaciones** | ✅ Completado | Sistema de Toasts funcional. |
| **4. SortableJS** | ✅ Completado | Integración de Drag and Drop funcional. |
| **5. Modo Oscuro** | ✅ Completado | Implementación de switch de tema con persistencia. |

## Notas Técnicas Actualizadas
- Se ha añadido la fuente 'Inter' desde Google Fonts para mejorar la legibilidad en pantallas de alta densidad.
- La inicialización de iconos Lucide se realiza mediante `lucide.createIcons()` después de cada ciclo de renderizado en `TaskManager.js`.

## Notas Técnicas
- Mantener la compatibilidad con el sistema de archivos local (evitar módulos ES6 si es necesario para evitar bloqueos de CORS).
- Asegurar que las animaciones de CSS no afecten el rendimiento del cronómetro de alta precisión en `TaskManager.js`.