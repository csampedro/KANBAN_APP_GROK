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

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('kanban-theme', targetTheme);
        updateThemeIcon(targetTheme);
    }

    function updateThemeIcon(theme) {
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            if (window.lucide) window.lucide.createIcons();
        }
    }

    function agregarTarea(nombre) {
        const maxOrden = Math.max(...tareas.filter(t => t.estado === 'para-hacer').map(t => t.orden || 0), 0);
        const nuevaTarea = new Task(generarId(), nombre, 'para-hacer', 0, maxOrden + 1);
        tareas.push(nuevaTarea);
        showToast(`Tarea "${nombre}" creada`);
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
            if (nuevoEstado === 'finalizadas') {
                showToast("¡Tarea finalizada!");
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

    function initSortable() {
        const contenedores = document.querySelectorAll('.tareas-contenedor');
        contenedores.forEach(el => {
            new Sortable(el, {
                group: 'kanban',
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function (evt) {
                    const id = evt.item.dataset.id;
                    const nuevoEstado = evt.to.closest('.columna').id;
                    
                    // Buscar la tarea y actualizar su estado
                    const tarea = tareas.find(t => t.id.toString() === id.toString());
                    if (tarea) {
                        tarea.actualizarEstado(nuevoEstado);
                    }

                    // Re-calcular el orden de todas las tareas en la columna de destino
                    const itemElements = Array.from(evt.to.children);
                    itemElements.forEach((el, index) => {
                        const t = tareas.find(task => task.id.toString() === el.dataset.id.toString());
                        if (t) t.actualizarOrden(index + 1);
                    });

                    // Si se mueve fuera de 'haciendo' y era la seleccionada, detener cronómetro
                    if (nuevoEstado !== 'haciendo' && tareaSeleccionada?.id.toString() === id.toString()) {
                        detenerCronometro();
                        tareaSeleccionada = null;
                    }
                    saveAndRender();
                },
            });
        });
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
                    <div class="actions"></div>
                `;
    
                const actionsDiv = div.querySelector('.actions');

                // Botones existentes según el estado
                if (tarea.estado === 'para-hacer') {
                    actionsDiv.innerHTML += `
                        <button class="btn-icon" title="Iniciar" onclick="event.stopPropagation(); TaskManager.moverTarea('${tarea.id}', 'haciendo')"><i data-lucide="play"></i></button>
                        <button class="btn-icon" title="Editar" onclick="event.stopPropagation(); TaskManager.editarTarea('${tarea.id}', prompt('Nuevo nombre:', '${tarea.nombre}'))"><i data-lucide="edit-3"></i></button>
                    `;
                } else if (tarea.estado === 'haciendo') {
                    actionsDiv.innerHTML += `
                        <button class="btn-icon" title="Finalizar" onclick="event.stopPropagation(); TaskManager.moverTarea('${tarea.id}', 'finalizadas')"><i data-lucide="check-circle"></i></button>
                        <button class="btn-icon" title="Editar" onclick="event.stopPropagation(); TaskManager.editarTarea('${tarea.id}', prompt('Nuevo nombre:', '${tarea.nombre}'))"><i data-lucide="edit-3"></i></button>
                        <button class="btn-icon" title="Regresar" onclick="event.stopPropagation(); TaskManager.regresarTarea('${tarea.id}', 'para-hacer')"><i data-lucide="rotate-ccw"></i></button>
                    `;
                    if (tareaSeleccionada?.id.toString() === tarea.id.toString()) {
                        div.classList.add('seleccionada');
                    }
                } else if (tarea.estado === 'finalizadas') {
                    actionsDiv.innerHTML += `
                        <button class="btn-icon" title="Reabrir" onclick="event.stopPropagation(); TaskManager.regresarTarea('${tarea.id}', 'haciendo')"><i data-lucide="external-link"></i></button>
                    `;
                }
    
                columnas[estado].appendChild(div);
            });
            
            // Inicializar iconos de Lucide después de renderizar
            if (window.lucide) {
                window.lucide.createIcons();
            }
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

    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: #2d3436; color: white; padding: 12px 20px; 
            border-radius: 8px; margin-top: 10px; box-shadow: var(--shadow);
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Inicializar Tema
    const savedTheme = localStorage.getItem('kanban-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Cargar tareas al inicio y renderizar
    loadTasks();
    renderizarTareas();
    initSortable();
    setTimeout(() => updateThemeIcon(savedTheme), 100); // Pequeño delay para asegurar carga de DOM

    // Exponer funciones públicas
    return {
        agregarTarea,
        moverTarea,
        regresarTarea,
        seleccionarTarea,
        iniciarCronometro,
        detenerCronometro,
        toggleTheme,
        editarTarea,
        subirTarea,
        bajarTarea,
        renderizarTareas,
        tareas // Para depuración
    };
})();