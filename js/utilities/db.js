// Wrapper para IndexedDB (H1.2)
window.KanbanDB = (function() {
    const DB_NAME = 'KanbanProDB';
    const STORE_NAME = 'kanban_data';
    const VERSION = 1;

    function openDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error("IndexedDB no es soportado en este navegador."));
                return;
            }

            const request = indexedDB.open(DB_NAME, VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async function save(key, data) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error("Base de datos no disponible"));
                return;
            }
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(data, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async function load(key) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error("Base de datos no disponible"));
                return;
            }
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function hasData(key) {
        const data = await load(key);
        return data !== undefined;
    }

    return {
        save,
        load,
        hasData
    };
})();