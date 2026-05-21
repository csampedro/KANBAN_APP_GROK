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

    // Estilos dinámicos para el Modo Zen (H2.2)
    const zenStyles = document.createElement('style');
    zenStyles.innerHTML = `
        .zen-active #para-hacer, .zen-active #finalizadas {
            opacity: 0.1;
            pointer-events: none;
            filter: blur(4px);
            transition: all 0.5s ease;
        }
        .zen-active .columna#haciendo {
            transform: scale(1.02);
            transition: transform 0.5s ease;
            flex: 2;
        }
        .board-container { transition: all 0.5s ease; }
    `;
    document.head.appendChild(zenStyles);

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

    function verificarCuotaAlmacenamiento() {
        const storageString = JSON.stringify(localStorage);
        const sizeInBytes = new Blob([storageString]).size;
        const limitInBytes = 5 * 1024 * 1024; // Límite real de 5MB
        const porcentajeUso = (sizeInBytes / limitInBytes) * 100;

        if (porcentajeUso > 80) {
            showToast(`⚠️ Almacenamiento al ${porcentajeUso.toFixed(1)}%. ¡Libera espacio limpiando tareas finalizadas!`);
        }
    }

    function verificarBackupPeriodico() {
        const lastBackup = localStorage.getItem('kanban-last-backup');
        const unaSemanaMs = 7 * 24 * 60 * 60 * 1000;
        
        if (!lastBackup || (Date.now() - parseInt(lastBackup)) > unaSemanaMs) {
            setTimeout(() => {
                showToast("💡 No has realizado un respaldo en una semana. ¡Usa Exportar para proteger tus datos!");
            }, 5000); // Dar un margen de tiempo tras la carga inicial
        }
    }

    function limpiarTareasFinalizadas() {
        const finalizadasCount = tareas.filter(t => t.estado === 'finalizadas').length;
        if (finalizadasCount === 0) {
            showToast("No hay tareas finalizadas para limpiar.");
            return;
        }

        if (confirm(`¿Deseas eliminar ${finalizadasCount} tareas finalizadas para liberar espacio? (Se recomienda exportar primero)`)) {
            tareas = tareas.filter(t => t.estado !== 'finalizadas');
            saveAndRender();
            showToast("Almacenamiento optimizado con éxito.");
        }
    }

    function actualizarInterfazModoZen() {
        const board = document.querySelector('.board-container') || document.body;
        if (tareaSeleccionada) {
            board.classList.add('zen-active');
            console.log("Modo Zen activado: Enfoque total en", tareaSeleccionada.nombre);
        } else {
            board.classList.remove('zen-active');
        }
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
            actualizarInterfazModoZen();
        }
    }

    function detenerCronometro() {
        if (intervalo) {
            clearInterval(intervalo);
            intervalo = null;
            actualizarInterfazModoZen();
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

    function configurarWIP(nuevoLimite) {
        const parsed = parseInt(nuevoLimite);
        if (!isNaN(parsed) && parsed > 0) {
            wipLimit = parsed;
            localStorage.setItem('kanban-wip-limit', wipLimit);
            showToast(`Límite WIP actualizado a ${wipLimit}`);
            renderizarTareas();
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
        localStorage.setItem('kanban-last-backup', Date.now().toString());
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
        // Persistencia secundaria en IndexedDB (H1.2) para seguridad extra
        if (window.KanbanDB) {
            window.KanbanDB.save('state', { tareas, idCounter });
        }
        verificarCuotaAlmacenamiento();
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

    // Sugerencia de Review: Mover a un archivo de utilidades para testing unitario
    function formatTime(segundos) { 
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = segundos % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
    }

    async function loadTasks() {
        // Lógica de Migración IndexedDB (H1.2)
        try {
            if (window.KanbanDB) {
                const dbData = await window.KanbanDB.load('state');
                if (dbData) {
                    console.log("Cargando datos desde IndexedDB...");
                    tareas = dbData.tareas.map(t => new Task(t.id, t.nombre, t.estado, t.tiempo, t.orden || 0, t.pomodoros || 0, t.historial || {}));
                    idCounter = dbData.idCounter || 0;
                    renderizarTareas();
                    return;
                }
            }
        } catch (e) {
            console.warn("Fallo al cargar de IndexedDB, usando localStorage como fallback", e);
        }

        // Fallback a localStorage y migración inicial
        const { tareas: loadedTasks, idCounter: loadedIdCounter } = window.cargarTareas();
        const selectedId = tareaSeleccionada ? tareaSeleccionada.id.toString() : null;
        const localTime = tareaSeleccionada ? tareaSeleccionada.tiempo : 0;

        tareas = loadedTasks.map(t => {
            if (!t.orden) t.orden = 0;
            return new Task(t.id, t.nombre, t.estado, t.tiempo, t.orden, t.pomodoros || 0, t.historial || {});
        });

        // Migrar a IndexedDB si hay datos en localStorage
        if (tareas.length > 0 && window.KanbanDB) {
            try {
                await window.KanbanDB.save('state', { tareas, idCounter: loadedIdCounter });
                localStorage.removeItem('tareas'); // [BUG-001 FIX] Evitar datos duplicados/viejos
                console.log("Migración a IndexedDB completada y localStorage purgado.");
            } catch (e) {
                console.error("Error durante la migración de datos", e);
            }
        }

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
        renderizarTareas();
    }

    function mostrarEstadisticas() {
        const totalPomodoros = tareas.reduce((acc, t) => acc + (t.pomodoros || 0), 0);
        const totalTiempo = tareas.reduce((acc, t) => acc + t.tiempo, 0);
        const completadas = tareas.filter(t => t.estado === 'finalizadas').length;
        
        // --- Heatmap Data Aggregation (for last 6 months) ---
        const dailyActivity = {};
        tareas.forEach(task => {
            if (task.historial) {
                for (const date in task.historial) {
                    if (task.historial.hasOwnProperty(date)) {
                        dailyActivity[date] = (dailyActivity[date] || 0) + task.historial[date];
                    }
                }
            }
        });

        // Consolidate current active task time for display purposes only (without stopping timer or saving)
        if (tareaSeleccionada && intervalo) { // If a task is currently running
            const todayIso = new Date().toISOString().slice(0, 10);
            dailyActivity[todayIso] = (dailyActivity[todayIso] || 0) + tareaSeleccionada.tiempo;
        }

        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        
        const datesForGrid = [];
        let cursorDate = new Date(sixMonthsAgo);
        // Adjust to start on Monday of the week containing sixMonthsAgo
        cursorDate.setDate(cursorDate.getDate() - cursorDate.getDay() + (cursorDate.getDay() === 0 ? -6 : 1)); 

        while (cursorDate <= today) {
            datesForGrid.push(new Date(cursorDate));
            cursorDate.setDate(cursorDate.getDate() + 1);
        }

        // Determine max activity for color scaling
        const allDailyTotals = Object.values(dailyActivity);
        const maxActivityInPeriod = allDailyTotals.length > 0 ? Math.max(...allDailyTotals) : 1; // Avoid division by zero

        // Color scale (using CSS variables, assuming they are defined in the main CSS)
        const colorScale = [
            'var(--emerald-100, #D1FAE5)', // Lightest (default if variable not found)
            'var(--emerald-300, #6EE7B7)',
            'var(--emerald-500, #10B981)',
            'var(--emerald-700, #047857)',
            'var(--emerald-900, #064E3B)'  // Darkest
        ];

        function getActivityColor(seconds) {
            if (seconds === 0) return 'var(--bg-column)'; // No activity, use column background
            const percentage = seconds / maxActivityInPeriod;
            if (percentage <= 0.2) return colorScale[0];
            if (percentage <= 0.4) return colorScale[1];
            if (percentage <= 0.6) return colorScale[2];
            if (percentage <= 0.8) return colorScale[3];
            return colorScale[4];
        }

        // 2. Lógica para la distribución de Pomodoros por tarea
        const tareasConPomodoros = tareas.filter(t => (t.pomodoros || 0) > 0);
        const maxPomodoros = Math.max(...tareasConPomodoros.map(t => t.pomodoros), 1);
        
        // --- Heatmap HTML Generation ---
        const numWeeks = Math.ceil(datesForGrid.length / 7);
        let heatmapCellsHtml = '';
        
        // Collect unique months for labels
        const monthsInPeriod = Array.from(new Set(datesForGrid.map(d => d.toLocaleString('es-ES', { month: 'short', year: '2-digit' }))));
        const monthLabelsHtml = monthsInPeriod.map(month => `<span style="flex: 1; text-align: center; color: var(--text-secondary);">${month}</span>`).join('');

        datesForGrid.forEach((date) => {
            const isoDate = date.toISOString().slice(0, 10);
            const seconds = dailyActivity[isoDate] || 0;
            const color = getActivityColor(seconds);
            const tooltip = `${date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}: ${formatTime(seconds)}`;

            heatmapCellsHtml += `
                <div class="heatmap-cell" 
                     style="background-color: ${color}; width: 12px; height: 12px; border-radius: 2px;"
                     title="${tooltip}"></div>
            `;
        });

        let heatmapHtml = `
            <div style="margin-bottom: 25px;">
                <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Mapa de Calor de Productividad (Últimos 6 meses)</h3>
                <div style="display: flex; justify-content: space-around; margin-bottom: 5px; padding-left: 20px;">
                    ${monthLabelsHtml}
                </div>
                <div id="heatmap-grid" style="display: grid; grid-template-columns: auto repeat(${numWeeks}, 1fr); gap: 2px; font-size: 0.7rem;">
                    <div style="display: flex; flex-direction: column; justify-content: space-around; padding-right: 5px; color: var(--text-secondary);">
                        <span>Lun</span>
                        <span>Mar</span>
                        <span>Mié</span>
                        <span>Jue</span>
                        <span>Vie</span>
                        <span>Sáb</span>
                        <span>Dom</span>
                    </div>
                    ${heatmapCellsHtml}
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
                <div style="background:var(--bg-card); padding:30px; border-radius:var(--border-radius); max-width:700px; width:95%; position:relative; color: var(--text-main); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);">
                    <h2 style="margin-top:0; display: flex; align-items: center; gap: 10px;">📊 Dashboard de Enfoque</h2>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin: 20px 0;">
                        <div style="text-align:center; padding:15px; background:var(--bg-column); border-radius:12px; border: 1px solid rgba(0,0,0,0.05);"><span style="font-size:1.5rem">🍅</span><br><strong style="font-size: 1.2rem;">${totalPomodoros}</strong><br><span style="font-size: 0.8rem; color: var(--text-secondary);">Pomodoros</span></div>
                        <div style="text-align:center; padding:15px; background:var(--bg-column); border-radius:12px; border: 1px solid rgba(0,0,0,0.05);"><span style="font-size:1.5rem">⏱️</span><br><strong style="font-size: 1.2rem;">${formatTime(totalTiempo).split(':').slice(0,2).join('h ')}m</strong><br><span style="font-size: 0.8rem; color: var(--text-secondary);">Invertido</span></div>
                    </div>
                    <p>Tareas finalizadas: <strong>${completadas}</strong></p>
                    <div style="background: var(--bg-primary); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--bg-column); overflow-x: auto;">
                        ${heatmapHtml}
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
    verificarBackupPeriodico();
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
        limpiarTareasFinalizadas,
        renderizarTareas,
        tareas // Para depuración
    };
})();