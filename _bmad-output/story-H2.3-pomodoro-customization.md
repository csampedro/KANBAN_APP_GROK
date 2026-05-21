# User Story H2.3: Sesiones de Pomodoro Personalizadas
**Estado:** Completado (100%)
**Épica:** Motor de Enfoque Avanzado (Deep Work Engine)

## Descripción
Como practicante de la técnica Pomodoro, quiero poder ajustar los tiempos de enfoque (ej. 25, 45 o 50 min) y los descansos para adaptar la herramienta a mis ciclos de energía.

## Criterios de Aceptación
- [x] Interfaz de configuración para definir el tiempo de "Bloque Pomodoro" (en minutos).
- [x] Persistir esta configuración en `localStorage`.
- [x] Disparar la notificación de "Bloque completado" basada en el nuevo tiempo dinámico.
- [x] Mostrar visualmente cuánto falta para completar el bloque actual en la tarjeta de la tarea.

## Detalles Técnicos
La constante `POMODORO_TIME` fue reemplazada por una propiedad dinámica en el objeto de configuración del `TaskManager`. 
Se implementó una barra de progreso circular mínima en la tarjeta de la tarea activa que visualiza el avance del bloque actual.

## Notas
Considerar añadir un modo "Maratón" que desactive las alertas de pomodoro para tareas de flujo largo.