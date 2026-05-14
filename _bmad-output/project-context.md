# Contexto del Proyecto: Kanban con Cronómetro

Este documento centraliza las estrategias de diseño y desarrollo para transformar la aplicación de una herramienta funcional a un producto profesional con alta usabilidad.

## Brainstorming: Mejora del Look and Feel

### 0. Estrategia de Producto (PR/FAQ)
Para asegurar que el desarrollo técnico se traduce en valor real, utilizaremos el framework PR/FAQ:

**El Titular del Lanzamiento:** 
> "Kanban Pro: La primera herramienta de productividad que protege tu privacidad y entrena tu enfoque, sin necesidad de la nube."

**Preguntas Frecuentes Clave (FAQ):**
- **¿Por qué local-first?** Para garantizar latencia cero y privacidad total. Tus datos nunca salen de tu máquina.
- **¿Por qué el límite de 3 tareas?** Basado en principios de Kanban real (WIP Limits), la app no solo organiza, sino que actúa como un coach de productividad evitando el burnout.
- **¿Cómo exporto mi trabajo?** A través del sistema de reportes CSV (Fase 3), permitiendo integración con herramientas de facturación o archivos personales.

**Internal FAQ (Técnico):**
- **¿Qué ocurre si el `localStorage` alcanza su límite (QuotaExceededError)?**  
  Se implementará un sistema de "Data Pruning". Al superar el 80% de capacidad, se solicitará al usuario exportar las tareas de la columna "Finalizadas" a un archivo JSON histórico para liberar espacio en el almacenamiento activo.
- **¿Cómo garantizamos la integridad de los datos en sesiones largas?**  
  Utilizamos un esquema de guardado atómico en el cronómetro. El `setInterval` de guardado (cada 1 min) asegura que, ante un fallo del navegador, la pérdida de datos sea mínima.
- **¿Cuál es el plan de escalabilidad si el volumen de tareas crece exponencialmente?**  
  La arquitectura está preparada para migrar de `localStorage` a `IndexedDB`. Esto permitiría manejar GBs de datos y habilitar búsquedas indexadas sobre el historial de tiempos sin degradar la latencia de carga.
- **¿Cómo manejamos la concurrencia de pestañas?**  
  Se utiliza el evento `storage` de la Window API para sincronizar el estado entre múltiples pestañas abiertas, evitando que un cronómetro activo en una pestaña sobrescriba datos de otra.

---

## Brainstorming: Mejora del Look and Feel
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

## Insights de Investigación (bmad-market-research)

Como resultado de la ejecución del workflow `bmad-market-research`, se han definido los siguientes pilares de diferenciación para el producto:

1. **Gestión de Tiempo Proactiva:** La investigación indica que los usuarios prefieren la comparación entre "tiempo estimado" y "tiempo real" sobre el simple seguimiento pasivo.
2. **Modo de Enfoque (Pomodoro):** Se detectó una alta demanda por la integración de bloques de concentración (25/5 min) directamente en el flujo de trabajo del tablero.
3. **Privacidad "Local-First":** El análisis de la competencia resalta una oportunidad en usuarios que evitan herramientas en la nube por motivos de privacidad; la arquitectura actual de la app es un diferenciador clave.
4. **Límites de Trabajo en Progreso (WIP):** Para evitar el multitasking, el mercado responde positivamente a funciones que restringen tener más de un cronómetro activo simultáneamente.

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
| **1.5 Definición de Producto** | ✅ Completado | Product Brief creado con foco en MVP y Historias de Usuario. |
| **2. Iconografía** | ✅ Completado | Migración de botones de texto a Lucide Icons. |
| **3. Notificaciones** | ✅ Completado | Sistema de Toasts funcional. |
| **4. SortableJS** | ✅ Completado | Integración de Drag and Drop funcional. |
| **5. Modo Oscuro** | ✅ Completado | Implementación de switch de tema con persistencia. |
| **6. Control de Enfoque** | ✅ Completado | Límites WIP (3 tareas) y Alerta de Tiempo Excedido (2h). |
| **7. Modo Pomodoro** | ✅ Completado | Notificación visual a los 25 minutos (Fase 2). |
| **8. Seguridad de Datos** | ✅ Completado | Guardado automático cada minuto de la tarea activa. |
| **9. Exportación CSV** | ✅ Completado | Fase 3: Generación de reportes de tiempo descargables. |
| **10. Historial Diario** | ✅ Completado | Fase 4: Registro de tiempo y dashboard de actividad semanal. |

### Refinamientos UX (create-ux-design)
- **Empty States:** Visualización amigable cuando no hay tareas en una columna.
- **Micro-interacciones:** Animaciones elásticas en Toasts y desenfoque de fondo en modales.
- **Jerarquía de Datos:** Dashboard de estadísticas con mejor legibilidad de tiempos (h m).

## Notas Técnicas Actualizadas
- Se ha añadido la fuente 'Inter' desde Google Fonts para mejorar la legibilidad en pantallas de alta densidad.
- La inicialización de iconos Lucide se realiza mediante `lucide.createIcons()` después de cada ciclo de renderizado en `TaskManager.js`.

## Notas Técnicas
- Mantener la compatibilidad con el sistema de archivos local (evitar módulos ES6 si es necesario para evitar bloqueos de CORS).
- Asegurar que las animaciones de CSS no afecten el rendimiento del cronómetro de alta precisión en `TaskManager.js`.