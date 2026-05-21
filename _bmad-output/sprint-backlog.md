# Sprint Backlog 1: Robustez y Velocidad

**Estado:** En Progreso | **Prioridad:** Alta

## Tareas Técnicas

1. **[UX] Implementación de Atajos Globales (Story 4.1):** ✅
   - `Espacio`: Pausar/Reanudar cronómetro de tarea seleccionada. ✅
   - `N`: Disparar prompt de nueva tarea. ✅
   - `Esc`: Cancelar selección/Cerrar modales. ✅

2. **[Lógica] WIP Limits Dinámicos (Story 2.1):** ✅
   - Migrar `WIP_LIMIT_HACIENDO` de constante a variable persistente. ✅
   - Crear función `configurarWIP()` para permitir al usuario cambiar el límite (default: 3). ✅

3. **[Infra] Setup de IndexedDB (Story 1.2 - Fase Inicial):**
   - Crear `js/utilities/storage-idb.js`.
   - Implementar esquema básico de base de datos para `tareas_v2`.

4. **[Refactor] Optimización de Eventos:**
   - Centralizar la escucha de teclado en `TaskManager` para evitar múltiples listeners en el DOM.