function guardarTareas(tareas, idCounter) {
    localStorage.setItem('tareas', JSON.stringify(tareas));
    localStorage.setItem('idCounter', idCounter);
}

function cargarTareas() {
    const tareasGuardadas = localStorage.getItem('tareas');
    const idCounter = parseInt(localStorage.getItem('idCounter')) || 0;
    return {
        tareas: tareasGuardadas ? JSON.parse(tareasGuardadas) : [],
        idCounter
    };
}

// Exponer las funciones globalmente
window.guardarTareas = guardarTareas;
window.cargarTareas = cargarTareas;