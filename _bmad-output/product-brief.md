# Product Brief: Kanban Pro (Local-First Time Tracker)

## 1. Visión del Producto
Crear la herramienta de gestión de tareas más ligera, privada y orientada al enfoque (focus) para profesionales independientes, integrando el seguimiento de tiempo directamente en el flujo visual del Kanban.

## 2. Definición del MVP
Para la versión 1.0, el producto debe incluir:
- Tablero Kanban con tres estados (Para hacer, Haciendo, Finalizadas).
- Sistema de cronómetro de alta precisión por tarea única.
- Persistencia local robusta (Local-First).
- Visualización de "Tiempo Excedido" basado en un límite de 2 horas predefinido.

## 3. Historias de Usuario Principales
- **Control de Enfoque:** "Como usuario, solo puedo tener una tarea activa en el cronómetro a la vez para evitar el multitasking".
- **Edición Rápida:** "Como usuario, puedo renombrar tareas sin interrumpir el flujo de mi trabajo actual".
- **Seguridad de Datos:** "Como usuario, mis tiempos de trabajo se guardan cada minuto automáticamente para evitar perder progreso si el navegador se cierra".

## 4. Requisitos Técnicos Clave
- **Arquitectura:** Vanila JavaScript (ES5/ES6 compatible con filesystem local) para evitar problemas de CORS.
- **UI/UX:** Sistema de diseño basado en variables CSS con soporte de modo oscuro.
- **Lógica de Negocio:** Encapsulada en `TaskManager` para facilitar pruebas futuras.

## 5. Métricas de Éxito
- **Latencia de Carga:** Menos de 200ms (gracias a ser una Single Page App local).
- **Integridad:** 100% de persistencia de tareas al recargar la página.

## 6. Roadmap (Próximas Fases)
- **Fase 2:** Implementación de modo Pomodoro (bloques de 25 min).
- **Fase 3:** Exportación de reportes de tiempo en formato CSV/JSON.
- **Fase 4:** Gráficas de productividad diaria.