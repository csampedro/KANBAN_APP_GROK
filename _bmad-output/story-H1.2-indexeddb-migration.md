# User Story H1.2: Migración a IndexedDB
**Estado:** Completado (100%)
**Épica:** Resiliencia y Escalabilidad de Datos

## Descripción
Como usuario con un volumen creciente de tareas, quiero que la app use IndexedDB en lugar de localStorage para no estar limitado por los 5MB del navegador.

## Criterios de Aceptación
- [x] Crear un wrapper `db.js` para manejar transacciones de IndexedDB.
- [x] Implementar script de migración automática al detectar datos en `localStorage`.
- [x] Mantener la misma interfaz de métodos que `storage.js` para evitar cambios disruptivos en `TaskManager`.

## Notas Técnicas
Usar una base de datos llamada `KanbanProDB` con un object store `tasks`. 
Asegurar que el ID autoincremental de IndexedDB sea compatible con nuestro `idCounter`.