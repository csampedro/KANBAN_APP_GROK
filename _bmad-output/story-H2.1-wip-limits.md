# User Story H2.1: Límites WIP Configurables
**Estado:** Completado (100%)
**Épica:** Motor de Enfoque Avanzado (Deep Work Engine)

## Descripción
Como usuario, quiero poder ajustar el número máximo de tareas permitidas en la columna "Haciendo" para adaptar el tablero a mi capacidad de enfoque personal.

## Criterios de Aceptación
- [x] Crear un campo de entrada numérico en el panel de configuración (o vía prompt).
- [x] Persistir el valor en `localStorage` bajo la clave `kanban-wip-limit`.
- [x] Validar que el movimiento de tareas a "Haciendo" respete el nuevo límite dinámico.

## Detalles Técnicos
Se ha refactorizado `TaskManager.js` para leer `wipLimit` desde la configuración persistida. Se añadió un método `setWipLimit(valor)` que valida que el nuevo límite no sea inferior a la cantidad de tareas actuales en "Haciendo".

## Notas
Un límite WIP bajo (1-3) fomenta la metodología Kanban pura y evita el multitasking.
Se integró una notificación Toast cuando el usuario intenta exceder el límite.