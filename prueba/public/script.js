const API_BASE = 'http://localhost:3000';

// Cargar archivos disponibles al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Cargando página...');
    loadAvailableFiles();
});

// Hacer las funciones globales para que funcionen con onclick
window.loadAllFiles = loadAllFiles;
window.loadSpecificFile = loadSpecificFile;

async function loadAvailableFiles() {
    console.log(' Cargando archivos disponibles...');
    try {
        const response = await fetch(`${API_BASE}/csv/available`);
        const data = await response.json();
        
        console.log(' Respuesta del servidor:', data);
        
        if (data.success) {
            displayFiles(data.files);
        } else {
            showError('Error al cargar la lista de archivos: ' + data.message);
        }
    } catch (error) {
        console.error(' Error de conexión:', error);
        showError('Error de conexión: ' + error.message);
    }
}

function displayFiles(files) {
    console.log(' Mostrando archivos:', files);
    const container = document.getElementById('files-container');
    container.innerHTML = '';

    // Filtrar solo archivos que existen
    const availableFiles = files.filter(file => file.exists);
    
    if (availableFiles.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>No hay archivos CSV disponibles</h3>
                <p>Asegúrate de que los archivos CSV estén en la carpeta server/data/</p>
            </div>
        `;
        return;
    }

    availableFiles.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card available';
        
        fileCard.innerHTML = `
            <div class="file-name">${file.filename}</div>
            <div class="file-table">Tabla: ${file.tableName}</div>
            <div class="file-status status-available">
                Listo para cargar
            </div>
            <button class="btn" onclick="loadSpecificFile('${file.filename}')" style="margin-top: 10px;">
                Cargar Este Archivo
            </button>
        `;
        
        container.appendChild(fileCard);
    });
}

async function loadAllFiles() {
    console.log(' Cargando todos los archivos...');
    showLoading(true);
    hideResults();

    try {
        const response = await fetch(`${API_BASE}/csv/load-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log(' Resultado de carga:', data);
        showLoading(false);
        
        if (data.success) {
            displayResults(data.results);
        } else {
            showError('Error al cargar archivos: ' + data.message);
        }
    } catch (error) {
        console.error(' Error cargando archivos:', error);
        showLoading(false);
        showError('Error de conexión: ' + error.message);
    }
}

async function loadSpecificFile(filename) {
    console.log(' Cargando archivo específico:', filename);
    showLoading(true);
    hideResults();

    try {
        const response = await fetch(`${API_BASE}/csv/load/${filename}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log(' Resultado archivo específico:', data);
        showLoading(false);
        
        if (data.success) {
            displayResults([data.result]);
        } else {
            showError('Error al cargar archivo: ' + data.message);
        }
    } catch (error) {
        console.error(' Error cargando archivo específico:', error);
        showLoading(false);
        showError('Error de conexión: ' + error.message);
    }
}

function displayResults(results) {
    const container = document.getElementById('results-container');
    const section = document.getElementById('results-section');
    
    container.innerHTML = '';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.success ? 'success' : 'error'}`;
        
        if (result.success) {
            resultItem.innerHTML = `
                <strong> ${result.filename}</strong><br>
                ${result.message}<br>
                <small>Registros procesados: ${result.recordsProcessed}</small>
            `;
        } else {
            resultItem.innerHTML = `
                <strong> ${result.filename}</strong><br>
                Error: ${result.error}
            `;
        }
        
        container.appendChild(resultItem);
    });
    
    section.classList.add('show');
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

function hideResults() {
    const section = document.getElementById('results-section');
    section.classList.remove('show');
}

function showError(message) {
    const container = document.getElementById('results-container');
    const section = document.getElementById('results-section');
    
    container.innerHTML = `
        <div class="result-item error">
            <strong> Error</strong><br>
            ${message}
        </div>
    `;
    
    section.classList.add('show');
}
