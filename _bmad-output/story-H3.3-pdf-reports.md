# User Story H3.3: Exportación de Reporte PDF
**Estado:** Completado (100%)
**Épica:** Inteligencia Visual y Reportes

## Descripción
Como profesional, quiero generar un resumen semanal elegante en formato PDF que liste mis tareas finalizadas y el tiempo invertido, para usarlo como sustento de mis horas trabajadas.

## Criterios de Aceptación
- [x] Generar un documento PDF con el logo de la app, fecha y resumen de actividad.
- [x] Incluir el total de pomodoros y horas por tarea finalizada.
- [x] El reporte debe incluir las notas o historial de los últimos 7 días.

## Detalles Técnicos
Se optó por una solución nativa de alta fidelidad utilizando `@media print`. Se creó una vista de reporte oculta que se activa al presionar "Exportar PDF", formateando los datos en tablas limpias y gráficos vectoriales (SVG) para asegurar máxima nitidez en el documento final.

## Notas
Se añadió un campo opcional para que el usuario incluya su nombre o nombre de empresa en el encabezado del reporte.