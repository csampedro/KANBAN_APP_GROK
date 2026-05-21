# User Story H4.1: Atajos de Teclado
**Estado:** Completado (100%)
**Épica:** Refinamiento de UX y Accesibilidad

## Descripción
Como "power user", quiero operar las funciones principales de la app (crear tareas, iniciar/detener tiempo) exclusivamente con el teclado para mejorar mi velocidad.

## Criterios de Aceptación
- [x] Tecla `N`: Abrir diálogo para nueva tarea.
- [x] Tecla `Espacio`: Iniciar/Detener cronómetro de la tarea seleccionada.
- [x] Tecla `Esc`: Deseleccionar tarea o cerrar modales.
- [x] Tecla `Enter`: Confirmar creación en prompts.

## Detalles Técnicos
Implementado mediante el listener `handleGlobalKeyDown` en `TaskManager.js`. 
Se añadió una guarda perimetral `if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;` para prevenir disparos accidentales. Se implementó un sistema de navegación por flechas para seleccionar tareas.

## Notas
Se agregaron Tooltips dinámicos que aparecen al mantener presionada la tecla `Alt` para enseñar los atajos al usuario.