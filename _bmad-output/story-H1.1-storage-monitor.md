# User Story H1.1: Gestión de Cuota y Pruning
**Estado:** Completado (100%)
**Épica:** Resiliencia y Escalabilidad de Datos

## Descripción
Como usuario intensivo, quiero que la app me avise cuando el almacenamiento local esté cerca de su límite (5MB) para evitar la pérdida silenciosa de datos.

## Criterios de Aceptación
- [x] Calcular el tamaño ocupado en `localStorage` en cada guardado.
- [x] Disparar una notificación (Toast) de advertencia al superar el 80% de ocupación.
- [x] Proporcionar un mecanismo para eliminar tareas finalizadas (Pruning).

## Detalles Técnicos
Implementado en `TaskManager.js` mediante la función `verificarCuotaAlmacenamiento`. 
Utiliza `JSON.stringify(localStorage)` y `Blob` para estimar el tamaño en bytes.
Se añadió `limpiarTareasFinalizadas()` para el mantenimiento preventivo del storage.

## Notas de Seguimiento
Esta funcionalidad es preventiva mientras se prepara la migración a IndexedDB (H1.2).