document.addEventListener('DOMContentLoaded', () => {
    if (!window.TaskManager) {
        console.error('TaskManager no está definido. Revisa el orden de los scripts o el archivo TaskManager.js');
        return;
    }
    console.log("TaskManager expuesto:", window.TaskManager);

    document.getElementById('agregar-tarea').addEventListener('click', () => {
        const nombre = prompt('Ingrese el nombre de la tarea:');
        if (nombre) window.TaskManager.agregarTarea(nombre);
    });

    document.addEventListener('click', (event) => {
        if (window.TaskManager.tareaSeleccionada) {
            const tareaElement = document.querySelector(`.tarea[data-id="${window.TaskManager.tareaSeleccionada.id}"]`);
            if (tareaElement && !tareaElement.contains(event.target)) {
                window.TaskManager.detenerCronometro();
                window.TaskManager.tareaSeleccionada = null;
                window.TaskManager.renderizarTareas();
            }
        }
    });
});