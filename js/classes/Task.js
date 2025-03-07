// Definimos Task como una función constructora global
function Task(id, nombre, estado, tiempo = 0, orden = 0) {
    this.id = id;
    this.nombre = nombre;
    this.estado = estado; // 'para-hacer', 'haciendo', 'finalizadas'
    this.tiempo = tiempo; // En segundos
    this.orden = orden;   // Para mantener el orden en la columna
}

Task.prototype.actualizarNombre = function(nuevoNombre) {
    this.nombre = nuevoNombre;
};

Task.prototype.actualizarEstado = function(nuevoEstado) {
    this.estado = nuevoEstado;
};

Task.prototype.incrementarTiempo = function() {
    this.tiempo++;
};

Task.prototype.actualizarOrden = function(nuevoOrden) {
    this.orden = nuevoOrden;
};

// Exponer Task globalmente
window.Task = Task;