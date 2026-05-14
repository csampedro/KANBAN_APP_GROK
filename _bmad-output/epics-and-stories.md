# Épicas e Historias de Usuario: Kanban Pro (Siguiente Nivel)

Este documento desglosa los pasos estratégicos para transformar el MVP en una herramienta de productividad de alto rendimiento, siguiendo la filosofía "Local-First".

## Épica 1: Resiliencia y Escalabilidad de Datos (Data Mastery)
*Objetivo: Superar las limitaciones de localStorage y garantizar la integridad total.*

- **Historia 1.1: Gestión de Cuota y Pruning.** Como usuario intensivo, quiero que la app me avise cuando el almacenamiento local esté al 80% de su capacidad para poder archivar tareas antiguas y no perder datos nuevos.
- **Historia 1.2: Migración a IndexedDB.** Como usuario con años de historial, quiero que mis datos se migren de `localStorage` a `IndexedDB` para permitir búsquedas rápidas en el historial y eliminar el límite de 5MB.
- **Historia 1.3: Copias de Seguridad Automatizadas.** Como usuario preocupado por mi privacidad, quiero poder configurar una exportación JSON automática cada semana para tener un respaldo físico de mi progreso.

## Épica 2: Motor de Enfoque Avanzado (Deep Work Engine)
*Objetivo: Refinar el sistema de seguimiento de tiempo y reducir distracciones.*

- **Historia 2.1: Límites WIP Configurables.** Como usuario con distintos ritmos de trabajo, quiero poder ajustar el límite de tareas en "Haciendo" (actualmente 3) desde un panel de configuración.
- **Historia 2.2: Modo Zen (Enfoque Total).** Como desarrollador, quiero poder ocultar las columnas de "Para hacer" y "Finalizadas" mientras el cronómetro está activo para eliminar el ruido visual.
- **Historia 2.3: Sesiones de Pomodoro Personalizadas.** Como practicante de la técnica Pomodoro, quiero ajustar los tiempos de enfoque (ej. 50 min) y descansos (10 min) según la complejidad de mi tarea.

## Épica 3: Inteligencia Visual y Reportes (Insights)
*Objetivo: Convertir el tiempo rastreado en información accionable.*

- **Historia 3.1: Mapa de Calor de Productividad.** Como usuario, quiero ver un mapa de calor (estilo GitHub) en mi dashboard para identificar mis rachas de trabajo y días más productivos.
- **Historia 3.2: Categorización por Etiquetas.** Como freelancer, quiero asignar etiquetas (ej. "Cliente A", "Admin", "Dev") a las tareas para ver un desglose porcentual de mi tiempo invertido por categoría.
- **Historia 3.3: Exportación de Reporte PDF.** Como profesional, quiero generar un resumen semanal en PDF con mis logros y tiempos para enviarlo a mis clientes o responsables.

## Épica 4: Refinamiento de UX y Accesibilidad
*Objetivo: Velocidad de operación y fluidez táctil.*

- **Historia 4.1: Atajos de Teclado.** Como "power user", quiero usar la tecla `Espacio` para iniciar/detener el cronómetro y `N` para crear una tarea nueva sin usar el ratón.
- **Historia 4.2: Temas de Sonido.** Como usuario, quiero elegir entre diferentes sonidos de "tick" (metrónomo, lluvia, ruido blanco) para ayudar a mi concentración durante el trabajo.
- **Historia 4.3: Soporte Offline PWA.** Como usuario móvil, quiero instalar la app como una PWA para que funcione perfectamente sin conexión a internet desde mi escritorio.