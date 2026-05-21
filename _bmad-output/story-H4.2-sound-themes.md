# User Story H4.2: Temas de Sonido
**Estado:** Backlog (0%)
**Épica:** Refinamiento de UX y Accesibilidad

## Descripción
Como usuario, quiero poder elegir entre diferentes sonidos de enfoque (como ruido blanco o el "tick" de un metrónomo) para crear una atmósfera de trabajo que me ayude a entrar en estado de flujo.

## Criterios de Aceptación
- [ ] Menú de selección de sonidos en la configuración.
- [ ] Opción para silenciar completamente el "tick" del cronómetro.
- [ ] Los sonidos deben reproducirse en bucle suave mientras el cronómetro esté activo.
- [ ] El volumen debe ser regulable independientemente del sistema.

## Detalles Técnicos
Se debe extender la lógica de `playTick()` en `TaskManager.js` para usar diferentes buffers de audio.

## Notas
Asegurar que los sonidos sean de baja frecuencia para evitar fatiga auditiva tras periodos largos de uso.