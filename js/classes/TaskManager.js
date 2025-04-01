// Definimos TaskManager como un objeto global
window.TaskManager = (function() {
    let tareas = [];
    let tareaSeleccionada = null;
    let intervalo = null;
    let intervaloGuardado = null;
    let idCounter = 0;

    function generarId() {
        return ++idCounter;
    }

    function agregarTarea(nombre) {
        const maxOrden = Math.max(...tareas.filter(t => t.estado === 'para-hacer').map(t => t.orden || 0), 0);
        const nuevaTarea = new Task(generarId(), nombre, 'para-hacer', 0, maxOrden + 1);
        tareas.push(nuevaTarea);
        saveAndRender();
    }

    function moverTarea(id, nuevoEstado) {
        const tarea = tareas.find(t => t.id.toString() === id.toString());
        if (tarea) {
            tarea.actualizarEstado(nuevoEstado);
            const maxOrden = Math.max(...tareas.filter(t => t.estado === nuevoEstado).map(t => t.orden || 0), 0);
            tarea.actualizarOrden(maxOrden + 1);
            if (nuevoEstado === 'finalizadas' && tareaSeleccionada?.id.toString() === id.toString()) {
                detenerCronometro();
                tareaSeleccionada = null;
            }
            saveAndRender();
        }
    }

    function regresarTarea(id, nuevoEstado) {
        const tarea = tareas.find(t => t.id.toString() === id.toString());
        if (tarea) {
            tarea.actualizarEstado(nuevoEstado);
            const maxOrden = Math.max(...tareas.filter(t => t.estado === nuevoEstado).map(t => t.orden || 0), 0);
            tarea.actualizarOrden(maxOrden + 1);
            if (tareaSeleccionada?.id.toString() === id.toString()) {
                detenerCronometro();
                tareaSeleccionada = null;
            }
            saveAndRender();
        }
    }

    function seleccionarTarea(id) {
        const tarea = tareas.find(t => t.id.toString() === id.toString());
        if (tarea && tarea.estado === 'haciendo') {
            if (tareaSeleccionada && tareaSeleccionada.id.toString() === id.toString()) {
                // Si la tarea ya está seleccionada, detener el cronómetro y el guardado
                detenerCronometro();
                detenerGuardadoAutomatico(); // Detener el guardado automático
                tareaSeleccionada = null;
                saveAndRender(); // Guardar inmediatamente al deseleccionar
            } else {
                // Si es otra tarea, detener el cronómetro y guardado actual
                if (tareaSeleccionada) {
                    detenerCronometro();
                    detenerGuardadoAutomatico(); // Detener el guardado automático
                    saveAndRender(); // Guardar inmediatamente al seleccionar
                }
                tareaSeleccionada = tarea;
                iniciarCronometro();
                iniciarGuardadoAutomatico(); // Iniciar el guardado automático
                saveAndRender(); // Guardar inmediatamente al deseleccionar o seleccionar tarea no válida
            }
        } else {
            // Si la tarea no está en "haciendo", detener el cronómetro y guardado
            detenerCronometro();
            detenerGuardadoAutomatico(); // Detener el guardado automático
            tareaSeleccionada = null;
        }
        renderizarTareas();
    }

    function iniciarCronometro() {
        if (tareaSeleccionada && !intervalo) {
            intervalo = setInterval(() => {
                tareaSeleccionada.incrementarTiempo();
                renderizarTareas();
            }, 1000);
        }
    }

    function detenerCronometro() {
        if (intervalo) {
            clearInterval(intervalo);
            intervalo = null;
        }
    }

    // Nueva función para iniciar el guardado automático cada minuto
    function iniciarGuardadoAutomatico() {
        if (!intervaloGuardado) {
            intervaloGuardado = setInterval(() => {
                if (tareaSeleccionada) {
                    saveAndRender(); // Guardar las tareas si hay una seleccionada
                }
            }, 60000); // 60000 ms = 1 minuto
        }
    }

    // Nueva función para detener el guardado automático
    function detenerGuardadoAutomatico() {
        if (intervaloGuardado) {
            clearInterval(intervaloGuardado);
            intervaloGuardado = null;
        }
    }

    function editarTarea(id, nuevoNombre) {
        const tarea = tareas.find(t => t.id.toString() === id.toString());
        if (tarea && (tarea.estado === 'para-hacer' || tarea.estado === 'haciendo')) {
            tarea.actualizarNombre(nuevoNombre);
            saveAndRender();
        }
    }

    function subirTarea(id) {
        const tarea = tareas.find(t => t.id.toString() === id.toString());
        if (!tarea) return;

        const tareasEnColumna = tareas.filter(t => t.estado === tarea.estado).sort((a, b) => (a.orden || 0) - (b.orden || 0));
        const index = tareasEnColumna.findIndex(t => t.id.toString() === id.toString());
        if (index > 0) {
            const tareaAnterior = tareasEnColumna[index - 1];
            [tarea.orden, tareaAnterior.orden] = [tareaAnterior.orden, tarea.orden];
            saveAndRender();
        }
    }

    function bajarTarea(id) {
        const tarea = tareas.find(t => t.id.toString() === id.toString());
        if (!tarea) return;

        const tareasEnColumna = tareas.filter(t => t.estado === tarea.estado).sort((a, b) => (a.orden || 0) - (b.orden || 0));
        const index = tareasEnColumna.findIndex(t => t.id.toString() === id.toString());
        if (index < tareasEnColumna.length - 1) {
            const tareaSiguiente = tareasEnColumna[index + 1];
            [tarea.orden, tareaSiguiente.orden] = [tareaSiguiente.orden, tarea.orden];
            saveAndRender();
        }
    }

    function saveAndRender() {
        renderizarTareas();
        window.guardarTareas(tareas, idCounter);
    }

    function renderizarTareas() {
        const columnas = {
            'para-hacer': document.querySelector('#para-hacer .tareas-contenedor'),
            'haciendo': document.querySelector('#haciendo .tareas-contenedor'),
            'finalizadas': document.querySelector('#finalizadas .tareas-contenedor')
        };
    
        Object.keys(columnas).forEach(estado => {
            columnas[estado].innerHTML = '';
            const tareasEstado = tareas.filter(t => t.estado === estado).sort((a, b) => (a.orden || 0) - (b.orden || 0));
            tareasEstado.forEach(tarea => {
                const div = document.createElement('div');
                div.classList.add('tarea');
                div.dataset.id = tarea.id;
                // Agregar evento onclick al div para iniciar/detener el cronómetro
                div.setAttribute('onclick', `TaskManager.seleccionarTarea('${tarea.id}')`);
                div.innerHTML = `
                    <h3>${tarea.nombre}</h3>
                    <p>Tiempo: <span id="tiempo-${tarea.id}">${formatTime(tarea.tiempo)}</span></p>
                `;
    
                // Botones existentes según el estado
                if (tarea.estado === 'para-hacer') {
                    div.innerHTML += `
                        <button onclick="event.stopPropagation(); TaskManager.moverTarea('${tarea.id}', 'haciendo')">Iniciar</button>
                        <button onclick="event.stopPropagation(); TaskManager.editarTarea('${tarea.id}', prompt('Nuevo nombre:', '${tarea.nombre}'))">Editar</button>
                    `;
                } else if (tarea.estado === 'haciendo') {
                    div.innerHTML += `
                        <button onclick="event.stopPropagation(); TaskManager.moverTarea('${tarea.id}', 'finalizadas')">Finalizar</button>
                        <button onclick="event.stopPropagation(); TaskManager.editarTarea('${tarea.id}', prompt('Nuevo nombre:', '${tarea.nombre}'))">Editar</button>
                        <button onclick="event.stopPropagation(); TaskManager.regresarTarea('${tarea.id}', 'para-hacer')">Regresar a Para hacer</button>
                    `;
                    if (tareaSeleccionada?.id.toString() === tarea.id.toString()) {
                        div.classList.add('seleccionada');
                    }
                } else if (tarea.estado === 'finalizadas') {
                    div.innerHTML += `
                        <button onclick="event.stopPropagation(); TaskManager.regresarTarea('${tarea.id}', 'haciendo')">Regresar a Haciendo</button>
                    `;
                }
    
                // // Agregar botones de subir y bajar para todas las columnas
                const index = tareasEstado.findIndex(t => t.id === tarea.id);
                const esPrimera = index === 0;
                const esUltima = index === tareasEstado.length - 1;
                div.innerHTML += `
                    <button onclick="event.stopPropagation(); TaskManager.subirTarea('${tarea.id}')" ${esPrimera ? 'disabled' : ''}>Subir</button>
                    <button onclick="event.stopPropagation(); TaskManager.bajarTarea('${tarea.id}')" ${esUltima ? 'disabled' : ''}>Bajar</button>
                `;
                    
                columnas[estado].appendChild(div);
            });
        });
    }

    function formatTime(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = segundos % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
    }

    function loadTasks() {
        const { tareas: loadedTasks, idCounter: loadedIdCounter } = window.cargarTareas();
        tareas = loadedTasks.map(t => {
            if (!t.orden) t.orden = 0;
            return new Task(t.id, t.nombre, t.estado, t.tiempo, t.orden);
        });
        idCounter = loadedIdCounter || 0;
        console.log("Tareas cargadas desde localStorage:", tareas);
    }

    // Cargar tareas al inicio y renderizar
    loadTasks();
    renderizarTareas();

    // Exponer funciones públicas
    return {
        agregarTarea,
        moverTarea,
        regresarTarea,
        seleccionarTarea,
        iniciarCronometro,
        detenerCronometro,
        editarTarea,
        subirTarea,
        bajarTarea,
        renderizarTareas,
        tareas // Para depuración
    };
})();