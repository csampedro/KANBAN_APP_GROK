# User Story H2.2: Modo Zen (Enfoque Total)
**Estado:** Completado (100%)
**Épica:** Motor de Enfoque Avanzado (Deep Work Engine)

## Descripción
Como usuario, quiero ocultar las columnas de "Para hacer" y "Finalizadas" mientras el cronómetro está activo para eliminar el ruido visual y concentrarme exclusivamente en la tarea actual.

## Criterios de Aceptación
- [x] Detectar cuando una tarea en "Haciendo" tiene el cronómetro activo.
- [x] Aplicar una clase CSS `.zen-active` al contenedor principal.
- [x] Reducir la opacidad y aplicar desenfoque (blur) a las columnas laterales.
- [x] Permitir que la columna "Haciendo" se centre o expanda visualmente.

## Detalles Técnicos
La lógica base ya fue inyectada en `TaskManager.js` mediante la función `actualizarInterfazModoZen`. Utiliza transiciones de CSS para asegurar que el cambio no sea disruptivo para el usuario.
Se añadió una regla CSS en el sistema de diseño para transformar el layout a una sola columna centrada cuando `.zen-active` está presente.

## Notas
Se debe asegurar que los diálogos de edición (prompts) sigan siendo visibles y funcionales por encima del efecto de desenfoque.