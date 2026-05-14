# Architectural Design Document: Kanban Pro

**Versión:** 1.0  
**Patrón Principal:** Modular Monolith (Singleton Module Pattern)  
**Estrategia de Datos:** Local-First / Offline-Only

## 1. Capas del Sistema

### 1.1. Capa de Dominio (Entities)
- **Task.js**: Define el modelo de datos fundamental. Contiene la lógica de negocio pura (incremento de tiempo, registro de pomodoros) sin dependencias de UI.

### 1.2. Capa de Orquestación (Services/Controller)
- **TaskManager.js**: Actúa como el cerebro del sistema. Maneja el estado global (`tareas`), la lógica del cronómetro de alta precisión, la gestión de eventos de Drag & Drop y la coordinación entre el almacenamiento y la vista.

### 1.3. Capa de Persistencia (Infrastructure)
- **storage.js**: Abstracción sobre la Web Storage API. Implementa un esquema de guardado atómico para prevenir la corrupción de datos durante cierres inesperados del navegador.

## 2. Flujo de Datos
La aplicación sigue un flujo de **Estado -> Persistencia -> Renderizado**:
1. Una acción del usuario (ej. mover tarea) modifica el array interno de tareas.
2. `TaskManager` invoca la persistencia inmediata en `localStorage`.
3. Se dispara un re-renderizado total de las columnas para asegurar que la UI sea una representación fiel del estado.

## 3. Estrategias Técnicas Clave

### 3.1. Sincronización Multi-Pestaña
Utiliza el evento `storage` de la Window API. Esto permite que si un usuario tiene abiertas dos pestañas del Kanban, los cambios en una (como finalizar una tarea) se reflejen instantáneamente en la otra, manteniendo la consistencia del cronómetro activo.

### 3.2. Gestión de Tiempo de Alta Precisión
El cronómetro no depende de la hora del sistema (que puede ser manipulada por el usuario), sino de un `setInterval` de 1 segundo que incrementa un contador relativo. Para sesiones largas, el sistema implementa un "Heartbeat Save" cada 60 segundos.

### 3.3. UI Desacoplada de Frameworks
Se utiliza manipulación directa del DOM con plantillas literales de ES6. Esto elimina la sobrecarga de un Virtual DOM y garantiza que la aplicación sea ejecutable directamente desde el sistema de archivos (`file://`).

## 4. Análisis de Escalabilidad
| Componente | Estado Actual | Escalabilidad Futura |
| :--- | :--- | :--- |
| **Almacenamiento** | `localStorage` (5MB lim.) | Migración a `IndexedDB` para soporte de adjuntos y grandes historiales. |
| **Renderizado** | Inyección de HTML | Web Components nativos para encapsulamiento de estilos. |
| **Estado** | Array simple | Implementación de un Reducer para manejar transiciones de estado complejas. |

## 5. Diagrama de Componentes (Conceptual)
```text
[ Usuario ] <--> [ TaskManager (UI/Eventos) ]
                        |
        ---------------------------------
        |               |               |
  [ Task Entity ] [ Timer Service ] [ Statistics Engine ]
        |               |               |
        ---------------------------------
                        |
              [ Storage Abstraction ]
                        |
                [ LocalStorage API ]
```