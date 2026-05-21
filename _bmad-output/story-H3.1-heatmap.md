# User Story H3.1: Mapa de Calor de Productividad
**Estado:** Completado (100%)
**Épica:** Inteligencia Visual y Reportes

## Descripción
Como usuario, quiero visualizar mi intensidad de trabajo diaria mediante un mapa de calor (estilo GitHub) para motivarme a mantener mis rachas de productividad.

## Criterios de Aceptación
- [x] Crear una cuadrícula de 7xN (aproximadamente 6 meses) en el modal de estadísticas.
- [x] Los colores deben variar de verde claro a oscuro según los segundos registrados en el `historial` de las tareas.
- [x] Mostrar el total de horas del día al pasar el ratón (hover) sobre un cuadro.

## Notas Técnicas
La lógica utiliza un reducer para agrupar el tiempo por fecha ISO (YYYY-MM-DD). 
Se implementó una escala cromática de 5 niveles basada en la paleta Emerald de Tailwind CSS.
Se optimizó el rendimiento mediante delegación de eventos para los tooltips de cada celda.
**Actualización:** Se refactorizó la implementación para generar un mapa de calor que cubre los últimos 6 meses, mostrando una cuadrícula de días y semanas con etiquetas de meses en la parte superior. El tiempo de la tarea activa se incluye en el cálculo para una visualización en tiempo real.

**Nota de Funcionamiento:** El mapa visualiza el tiempo activo registrado por el cronómetro. Mover tareas entre columnas sin haber activado el timer no generará actividad visible en el mapa.

**Mejora:** Se añadió un `overflow-x: auto;` al contenedor del dashboard para asegurar que el mapa de calor sea desplazable horizontalmente en pantallas más pequeñas.