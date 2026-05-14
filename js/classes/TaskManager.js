// Definimos TaskManager como un objeto global
window.TaskManager = (function() {
    let tareas = [];
    let tareaSeleccionada = null;
    let intervalo = null;
    let intervaloGuardado = null;
    let idCounter = 0;
    let audioCtx = null;

    let wipLimit = parseInt(localStorage.getItem('kanban-wip-limit')) || 3; 
    const POMODORO_TIME = 1500;   // 25 minutos en segundos (Brief: Fase 2)

    function playTick() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.04);
        } catch (e) { /* Audio no soportado o bloqueado por navegador */ }
    }

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
        if (!nombre || nombre.trim() === "") {
            showToast("El nombre de la tarea no puede estar vacío");
            return;
        }
        const maxOrden = Math.max(...tareas.filter(t => t.estado === 'para-hacer').map(t => t.orden || 0), 0);
        const nuevaTarea = new Task(generarId(), nombre, 'para-hacer', 0, maxOrden + 1);
        tareas.push(nuevaTarea);
        showToast(`Tarea "${nombre}" creada`);
        saveAndRender();
    }

    function moverTarea(id, nuevoEstado) {
        const tarea = tareas.find(t => t.id.toString() === id.toString());
        if (tarea) {
            // Validar límite WIP si se mueve a "Haciendo"
            if (nuevoEstado === 'haciendo' && tareas.filter(t => t.estado === 'haciendo').length >= wipLimit) {
                showToast(`Límite de enfoque alcanzado (${wipLimit} tareas). ¡Termina algo primero!`);
                return;
            }

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
            // Validar límite WIP si se reabre a "Haciendo"
            if (nuevoEstado === 'haciendo' && tareas.filter(t => t.estado === 'haciendo').length >= wipLimit) {
                showToast(`Límite de enfoque alcanzado (${wipLimit} tareas).`);
                return;
            }

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
                playTick();

                // Notificación Pomodoro (Fase 2 del Roadmap)
                if (tareaSeleccionada.tiempo === POMODORO_TIME) {
                    tareaSeleccionada.registrarPomodoro();
                    showToast("🍅 Bloque Pomodoro completado. ¡Considera un descanso!");
                    saveAndRender();
                }
                
                // Optimización: Actualizar solo el elemento de tiempo en el DOM
                const timerDisplay = document.getElementById(`tiempo-${tareaSeleccionada.id}`);
                if (timerDisplay) {
                    timerDisplay.textContent = formatTime(tareaSeleccionada.tiempo);
                    
                    // Alerta visual si excede 2 horas (7200 segundos)
                    if (tareaSeleccionada.tiempo >= 7200) {
                        timerDisplay.parentElement.classList.add('tiempo-excedido');
                        const card = timerDisplay.closest('.tarea');
                        if (card) card.style.borderLeftColor = 'var(--accent-warning)';
                    }
                } else {
                    // Fallback si la tarea no se encuentra en el DOM actual
                    renderizarTareas();
                }
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
                    // Optimizamos: Guardamos en storage sin disparar un re-render completo
                    // para evitar parpadeos visuales durante el trabajo enfocado.
                    window.guardarTareas(tareas, idCounter);
                    
                    // Actualizamos solo el indicador visual de guardado si existiera
                    const now = new Date().toLocaleTimeString();
                    console.log(`[${now}] Heartbeat: Progreso de "${tareaSeleccionada.nombre}" persistido.`);
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
        if (tarea && nuevoNombre && nuevoNombre.trim() !== "" && (tarea.estado === 'para-hacer' || tarea.estado === 'haciendo')) {
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

    function exportarDatos() {
        const data = JSON.stringify({ tareas, idCounter, theme: localStorage.getItem('kanban-theme') });
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanban-pro-data-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        showToast("Datos exportados a JSON");
    }

    function exportarCSV() {
        if (tareas.length === 0) {
            showToast("No hay tareas para exportar");
            return;
        }

        // Encabezados del CSV
        const headers = ["ID", "Tarea", "Estado", "Segundos Totales", "Tiempo Formateado", "Pomodoros", "Orden"];
        const rows = tareas.map(t => [
            t.id,
            `"${t.nombre.replace(/"/g, '""')}"`, // Escapar comillas dobles
            t.estado,
            t.tiempo,
            formatTime(t.tiempo),
            t.pomodoros || 0,
            t.orden
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte-kanban-${new Date().toISOString().slice(0, 10)}.csv`);
        link.click();
        showToast("Reporte CSV descargado con éxito");
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
        // Clonamos el estado para asegurar inmutabilidad durante el renderizado
        const snapshotTareas = [...tareas];

        const columnas = {
            'para-hacer': document.querySelector('#para-hacer .tareas-contenedor'),
            'haciendo': document.querySelector('#haciendo .tareas-contenedor'),
            'finalizadas': document.querySelector('#finalizadas .tareas-contenedor')
        };
    
        Object.keys(columnas).forEach(estado => {
            columnas[estado].innerHTML = '';
            const tareasEstado = snapshotTareas.filter(t => t.estado === estado).sort((a, b) => (a.orden || 0) - (b.orden || 0));
            
            if (tareasEstado.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.style.cssText = 'padding: 40px 20px; text-align: center; color: var(--text-secondary); opacity: 0.5; border: 2px dashed rgba(0,0,0,0.1); border-radius: 12px; margin: 10px;';
                emptyState.innerHTML = `<i data-lucide="layout" size="32" style="margin-bottom: 10px;"></i><br><span style="font-size: 0.8rem;">Sin tareas aquí</span>`;
                columnas[estado].appendChild(emptyState);
            } else {
                tareasEstado.forEach(tarea => {
                const div = document.createElement('div');
                div.classList.add('tarea');
                div.dataset.id = tarea.id;
                
                // Lógica de alerta si excede tiempo (ejemplo: 2 horas)
                if (tarea.tiempo >= 7200) {
                    div.classList.add('tiempo-excedido');
                    div.style.borderLeftColor = 'var(--accent-warning)';
                }
                
                // Agregar evento onclick al div para iniciar/detener el cronómetro
                div.setAttribute('onclick', `TaskManager.seleccionarTarea('${tarea.id}')`);
                div.innerHTML = `
                    <h3>${tarea.nombre}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <p class="time-display"><i data-lucide="clock" size="14"></i> <span id="tiempo-${tarea.id}">${formatTime(tarea.tiempo)}</span></p>
                        ${tarea.pomodoros > 0 ? 
                            `<span title="Pomodoros completados" style="font-size: 0.8rem; background: rgba(255,107,107,0.2); padding: 2px 6px; border-radius: 10px; color: #ff6b6b;">🍅 ${tarea.pomodoros}</span>` 
                            : ''}
                    </div>
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
            }
            
            // Inicializar iconos de Lucide después de renderizar
            if (window.lucide) {
                window.lucide.createIcons();
            }
        });
    }

    function handleGlobalKeyDown(e) {
        // Evitar disparar atajos si el usuario está escribiendo en un input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === 'Space') {
            e.preventDefault(); // Evitar scroll
            if (tareaSeleccionada) {
                seleccionarTarea(tareaSeleccionada.id);
            } else {
                showToast("Selecciona una tarea en 'Haciendo' para iniciar");
            }
        }
        if (e.key.toLowerCase() === 'n') {
            const nombre = prompt('Nueva tarea:');
            if (nombre) agregarTarea(nombre);
        }
    }

    function formatTime(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = segundos % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
    }

    function loadTasks() {
        const { tareas: loadedTasks, idCounter: loadedIdCounter } = window.cargarTareas();
        const selectedId = tareaSeleccionada ? tareaSeleccionada.id.toString() : null;
        const localTime = tareaSeleccionada ? tareaSeleccionada.tiempo : 0;

        tareas = loadedTasks.map(t => {
            if (!t.orden) t.orden = 0;
            return new Task(t.id, t.nombre, t.estado, t.tiempo, t.orden, t.pomodoros || 0, t.historial || {});
        });

        // Sincronizar tarea seleccionada con el estado de otras pestañas
        if (selectedId) {
            const syncedTask = tareas.find(t => t.id.toString() === selectedId);
            if (syncedTask && syncedTask.estado === 'haciendo') {
                // Preservamos el progreso del cronómetro local si es más avanzado que el guardado
                syncedTask.tiempo = Math.max(syncedTask.tiempo, localTime);
                tareaSeleccionada = syncedTask;
            } else {
                // Si la tarea se movió o borró en otra pestaña, detenemos localmente
                detenerCronometro();
                detenerGuardadoAutomatico();
                tareaSeleccionada = null;
            }
        }

        idCounter = loadedIdCounter || 0;
    }

    function mostrarEstadisticas() {
        const totalPomodoros = tareas.reduce((acc, t) => acc + (t.pomodoros || 0), 0);
        const totalTiempo = tareas.reduce((acc, t) => acc + t.tiempo, 0);
        const completadas = tareas.filter(t => t.estado === 'finalizadas').length;

        // 1. Lógica para la Gráfica de Actividad Diaria (Últimos 7 días)
        const ultimos7Dias = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            ultimos7Dias.push(d.toISOString().slice(0, 10));
        }

        const actividadDiaria = ultimos7Dias.map(fecha => {
            const totalSegundos = tareas.reduce((acc, t) => acc + (t.historial?.[fecha] || 0), 0);
            return { fecha, totalSegundos };
        });

        const maxSegundosDia = Math.max(...actividadDiaria.map(d => d.totalSegundos), 1);

        // 2. Lógica para la distribución de Pomodoros por tarea
        const tareasConPomodoros = tareas.filter(t => (t.pomodoros || 0) > 0);
        const maxPomodoros = Math.max(...tareasConPomodoros.map(t => t.pomodoros), 1);
        
        let activityChartHtml = `
            <div style="margin-bottom: 25px;">
                <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Actividad de la Semana</h3>
                <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 120px; padding: 15px; background: rgba(0,0,0,0.03); border-radius: 12px; border: 1px dashed var(--bg-column);">
                    ${actividadDiaria.map(d => {
                        const altura = (d.totalSegundos / maxSegundosDia) * 100;
                        const diaNombre = new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' });
                        const esHoy = d.fecha === new Date().toISOString().slice(0, 10);
                        return `
                            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%;">
                                <div style="flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
                                    <div title="${formatTime(d.totalSegundos)}" 
                                         style="width: 60%; background: ${esHoy ? 'var(--accent-success)' : 'var(--accent-color)'}; 
                                                height: ${Math.max(altura, 5)}%; border-radius: 4px 4px 2px 2px; 
                                                opacity: ${altura > 0 ? 1 : 0.2}; transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
                                </div>
                                <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: ${esHoy ? 'bold' : 'normal'}">${diaNombre}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        let pomodoroChartHtml = '';
        if (tareasConPomodoros.length > 0) {
            pomodoroChartHtml = `
                <div style="margin-top: 10px;">
                    <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Distribución por Tarea</h3>
                    <div style="max-height: 200px; overflow-y: auto; padding-right: 5px;">
                        ${tareasConPomodoros.map(t => `
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">${t.nombre}</span>
                                    <strong>${t.pomodoros} 🍅</strong>
                                </div>
                                <div style="background: var(--bg-column); height: 6px; border-radius: 3px; width: 100%;">
                                    <div style="background: var(--accent-success); height: 100%; border-radius: 3px; width: ${(t.pomodoros / maxPomodoros) * 100}%; transition: width 0.8s ease-out;"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const statsHtml = `
            <div id="stats-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:2000; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                <div style="background:var(--bg-card); padding:30px; border-radius:var(--border-radius); max-width:550px; width:95%; position:relative; color: var(--text-main); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);">
                    <h2 style="margin-top:0; display: flex; align-items: center; gap: 10px;">📊 Dashboard de Enfoque</h2>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin: 20px 0;">
                        <div style="text-align:center; padding:15px; background:var(--bg-column); border-radius:12px; border: 1px solid rgba(0,0,0,0.05);"><span style="font-size:1.5rem">🍅</span><br><strong style="font-size: 1.2rem;">${totalPomodoros}</strong><br><span style="font-size: 0.8rem; color: var(--text-secondary);">Pomodoros</span></div>
                        <div style="text-align:center; padding:15px; background:var(--bg-column); border-radius:12px; border: 1px solid rgba(0,0,0,0.05);"><span style="font-size:1.5rem">⏱️</span><br><strong style="font-size: 1.2rem;">${formatTime(totalTiempo).split(':').slice(0,2).join('h ')}m</strong><br><span style="font-size: 0.8rem; color: var(--text-secondary);">Invertido</span></div>
                    </div>
                    <p>Tareas finalizadas: <strong>${completadas}</strong></p>
                    <div style="background: var(--bg-primary); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--bg-column);">
                        ${activityChartHtml}
                        ${pomodoroChartHtml}
                    </div>
                    <button onclick="this.closest('#stats-modal').remove()" style="width:100%; padding:12px; background:var(--accent-color); color:white; border:none; border-radius:8px; cursor:pointer; font-weight: bold; transition: opacity 0.2s;">Entendido</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', statsHtml);
    }

    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            background: var(--bg-card); color: var(--text-main); padding: 12px 24px; 
            border-radius: 30px; margin-top: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            border-left: 4px solid var(--accent-color); font-weight: 500; font-size: 0.9rem;
            display: flex; align-items: center; gap: 10px; transform: translateX(120%);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        toast.innerHTML = `<i data-lucide="info" size="18"></i> ${message}`;
        container.appendChild(toast);
        
        if (window.lucide) window.lucide.createIcons();

        // Animación de entrada
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Sincronización entre pestañas: detectar cambios en localStorage desde otros contextos
    window.addEventListener('storage', (event) => {
        if (event.key === 'tareas') {
            loadTasks();
            renderizarTareas();
        }
    });

    // Registrar listener global para atajos
    window.addEventListener('keydown', handleGlobalKeyDown);

    // Inicializar Tema
    const savedTheme = localStorage.getItem('kanban-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Cargar tareas al inicio y renderizar
    loadTasks();
    renderizarTareas();
    initSortable();
    setTimeout(() => updateThemeIcon(savedTheme), 100); // Pequeño delay para asegurar carga de DOM

    // Adjuntar event listener para el botón de cambio de tema
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

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
        exportarDatos,
        exportarCSV,
        mostrarEstadisticas,
        configurarWIP,
        renderizarTareas,
        tareas // Para depuración
    };
})();