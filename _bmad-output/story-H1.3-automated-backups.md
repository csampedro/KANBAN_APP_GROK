# User Story H1.3: Copias de Seguridad Automatizadas
**Estado:** Completado (100%)
**Épica:** Resiliencia y Escalabilidad de Datos

## Descripción
Como usuario preocupado por mi privacidad, quiero que la aplicación me sugiera o realice una exportación JSON automática de mis datos periódicamente para tener un respaldo físico fuera del navegador.

## Criterios de Aceptación
- [x] Almacenar la fecha de la última exportación exitosa en el estado global.
- [x] Mostrar un aviso proactivo si han pasado más de 7 días desde el último respaldo manual o automático.
- [x] Permitir la descarga de un archivo JSON que contenga el estado íntegro (tareas, historial y configuración).
- [x] Validar que el archivo de respaldo pueda ser importado correctamente en una sesión limpia.

## Detalles Técnicos
Se utilizará la función `exportarDatos()` de `TaskManager.js` como base. Se añadirá un chequeo al inicializar la aplicación que compare `Date.now()` con la clave `kanban-last-backup` en `localStorage`.

## Notas
Esta funcionalidad es vital para el modelo "Local-First", ya que protege al usuario ante una limpieza accidental de la caché o datos del sitio por parte del navegador.