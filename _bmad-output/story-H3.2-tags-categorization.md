# User Story H3.2: Categorización por Etiquetas
**Estado:** Completado (100%)
**Épica:** Inteligencia Visual y Reportes

## Descripción
Como freelancer, quiero asignar etiquetas (ej. "Cliente A", "Dev", "Admin") a mis tareas para obtener un desglose claro de cómo distribuyo mi tiempo entre diferentes proyectos o tipos de actividad.

## Criterios de Aceptación
- [x] Permitir crear y asignar una o más etiquetas a cada tarea.
- [x] Mostrar la etiqueta con un color distintivo en la tarjeta del Kanban.
- [x] En el dashboard de estadísticas, mostrar un gráfico circular o porcentual del tiempo total por etiqueta.
- [x] Permitir filtrar el tablero por etiquetas.

## Detalles Técnicos
Se extendió el esquema de `Task` para incluir `tags: []`. Se implementó un componente `TagManager` que gestiona una paleta de 8 colores persistentes. La visualización se integró con un gráfico de dona (Donut Chart) en el nuevo panel de estadísticas.

## Notas
Se optimizó el filtrado para permitir la selección múltiple de etiquetas, actualizando el tablero en tiempo real.