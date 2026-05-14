// Definimos Task como una clase global de ES6
class Task {
    constructor(id, nombre, estado, tiempo = 0, orden = 0, pomodoros = 0, historial = {}) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado; // 'para-hacer', 'haciendo', 'finalizadas'
        this.tiempo = tiempo; // En segundos
        this.orden = orden;   // Para mantener el orden en la columna
        this.pomodoros = pomodoros; // Contador de bloques de 25 min
        this.historial = historial; // Registro de tiempo por fecha { 'YYYY-MM-DD': segundos }
    }

    actualizarNombre(nuevoNombre) {
        this.nombre = nuevoNombre;
    }

    actualizarEstado(nuevoEstado) {
        this.estado = nuevoEstado;
    }

    incrementarTiempo() {
        this.tiempo++;
        const hoy = new Date().toISOString().slice(0, 10);
        this.historial[hoy] = (this.historial[hoy] || 0) + 1;
    }

    actualizarOrden(nuevoOrden) {
        this.orden = nuevoOrden;
    }

    registrarPomodoro() {
        this.pomodoros++;
    }
}

// Exponer Task globalmente
window.Task = Task;