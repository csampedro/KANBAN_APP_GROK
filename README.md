# Gestor de Tareas con Cronómetro

## Estructura del Proyecto
- `index.html`: Contiene la estructura HTML de la aplicación.
- `css/styles.css`: Estilos CSS para la interfaz.
- `js/main.js`: Punto de entrada para la lógica de JavaScript.
- `js/classes/Task.js`: Clase para representar tareas individuales.
- `js/classes/TaskManager.js`: Clase para gestionar las tareas y su lógica.
- `js/utilities/storage.js`: Funciones para manejar el almacenamiento en `localStorage`.

## Uso
1. Crea la estructura de carpetas y archivos en tu sistema.
2. Abre `index.html` directamente en un navegador.
3. Usa el botón "Agregar Tarea" para crear nuevas tareas.
4. Haz clic en las tareas en "Haciendo" para iniciar/detener el cronómetro.
5. Usa los botones "Iniciar", "Finalizar", "Regresar", "Subir", "Bajar" y "Editar" para gestionar tareas.

## Notas
- Este proyecto usa JavaScript tradicional (sin módulos ES6) para evitar restricciones CORS al abrir desde el sistema de archivos local.
- Si las tareas no se cargan desde `localStorage`, revisa la consola para errores.

## Ventajas de Esta Solución MR

- Sin CORS: Al usar <script> estándar, puedes abrir index.html directamente desde tu sistema de archivos sin necesidad de un servidor local.
- Modularidad Mantenida: La estructura de carpetas y archivos sigue siendo modular, lo que facilita el mantenimiento y la expansión.
- Funcionalidad Completa: La aplicación sigue funcionando exactamente como antes, respetando todas las funcionalidades (cronómetro, reordenamiento, persistencia, etc.).