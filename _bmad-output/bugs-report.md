# Reporte de Bugs y Deuda Técnica - Sprint 1

## [BUG-001] Persistencia de Datos Obsoletos en localStorage (H1.2)
**Severidad:** Media  
**Descripción:** Tras la migración exitosa a IndexedDB, los datos en `localStorage` permanecían sin eliminarse.  
**Impacto:** Riesgo de cargar información antigua o inconsistente si IndexedDB fallaba.  
**Acción:** Se implementó `localStorage.removeItem('tareas')` tras confirmar el guardado en IndexedDB.

## [BUG-002] Riesgo de Inconsistencia en Cierres Inesperados (H1.2)
**Severidad:** Baja  
**Descripción:** La operación de guardado en `saveAndRender` es doble (síncrona en LS y asíncrona en IDB).  
**Impacto:** Desincronización momentánea ante fallos eléctricos o del navegador.  
**Acción:** Se priorizó el flujo asíncrono y se añadió un log de "Heartbeat" para monitoreo.

## [BUG-003] Falta de Manejo de Errores en Entornos Privados (H1.2)
**Severidad:** Media  
**Descripción:** Navegadores en modo incógnito a menudo bloquean el acceso a IndexedDB.  
**Impacto:** La aplicación podría dejar de funcionar o no persistir nada.  
**Acción:** Se añadieron bloques `try/catch` en `db.js` y un fallback automático hacia `localStorage`.

## [BUG-004] Mapa de Calor no refleja cambios inmediatos tras finalizar tarea
**Severidad:** Baja  
**Descripción:** Al completar una tarea moviéndola a 'Finalizadas', el tiempo de la sesión actual puede no verse reflejado en el mapa de calor inmediatamente.  
**Causa Probable:** El volcado de `currentSessionTime` al `historial` ocurre solo en `stopTimer()`.  
**Acción:** Se modificó `mostrarEstadisticas` para incluir el tiempo de la tarea actualmente seleccionada (si está activa) en el cálculo del mapa de calor, sin detener el cronómetro.

## [BUG-005] Discrepancia en la Implementación del Mapa de Calor (H3.1)
**Severidad:** Media
**Descripción:** La User Story H3.1 describe un "mapa de calor (estilo GitHub) en mi dashboard" con una "cuadrícula de 7x52", pero la implementación inicial en `mostrarEstadisticas` era un gráfico de barras de 7 días.
**Impacto:** La funcionalidad entregada no cumplía completamente con los criterios de aceptación visuales y de alcance.
**Acción:** Se refactorizó `mostrarEstadisticas` para generar un mapa de calor de 6 meses (aproximadamente 7x26 celdas) con la lógica de coloración y tooltips esperada.