// Global variables
let currentSection = 'home';
let currentEditId = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadDashboardStats();
});

// Initialize dashboard
function initializeDashboard() {
    showSection('home');
    loadAvailableCSVFiles();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Search inputs
    setupSearchListeners();
}

// Show specific section
function showSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');

    // Update page title
    const titles = {
        'home': 'Dashboard Principal',
        'clients': 'Gestión de Clientes',
        'transactions': 'Gestión de Transacciones',
        'invoices': 'Gestión de Facturas',
        'states': 'Gestión de Estados',
        'bulk-upload': 'Carga Masiva CSV'
    };
    document.getElementById('page-title').textContent = titles[section];

    currentSection = section;

    // Load data for specific sections
    switch(section) {
        case 'clients':
            loadClients();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'invoices':
            loadInvoices();
            break;
        case 'states':
            loadStates();
            break;
        case 'bulk-upload':
            loadAvailableCSVFiles();
            break;
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const [clientsRes, transactionsRes, invoicesRes, statesRes] = await Promise.all([
            fetch('/clients'),
            fetch('/transactions'),
            fetch('/invoices'),
            fetch('/transaction-states')
        ]);

        const clients = await clientsRes.json();
        const transactions = await transactionsRes.json();
        const invoices = await invoicesRes.json();
        const states = await statesRes.json();

        document.getElementById('total-clients').textContent = Array.isArray(clients) ? clients.length : 0;
        document.getElementById('total-transactions').textContent = Array.isArray(transactions) ? transactions.length : 0;
        document.getElementById('total-invoices').textContent = Array.isArray(invoices) ? invoices.length : 0;
        document.getElementById('total-states').textContent = Array.isArray(states) ? states.length : 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Cargar archivos disponibles al iniciar la página
async function loadAvailableCSVFiles() {
    console.log(' Cargando archivos CSV disponibles...');
    
    const csvFiles = [
        { filename: 'client.csv', tableName: 'clients', description: 'Datos de clientes' },
        { filename: 'transaction.csv', tableName: 'transactions', description: 'Datos de transacciones' },
        { filename: 'invoiced.csv', tableName: 'invoices', description: 'Datos de facturas' },
        { filename: 'state.csv', tableName: 'transaction_states', description: 'Estados de transacciones' }
    ];
    
    displayCSVFiles(csvFiles);
}

function displayCSVFiles(files) {
    const container = document.getElementById('csv-files-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        fileCard.innerHTML = `
            <i class="fas fa-file-csv"></i>
            <h4>${file.filename}</h4>
            <p>${file.description}</p>
            <p><small>Tabla: ${file.tableName}</small></p>
            <button class="btn btn-primary btn-sm" onclick="loadSpecificCSVFile('${file.filename}')">
                <i class="fas fa-upload"></i> Cargar
            </button>
        `;
        
        container.appendChild(fileCard);
    });
}

async function loadSpecificCSVFile(filename) {
    console.log(' Cargando archivo específico:', filename);
    showLoading(true);
    hideResults();

    try {
        const response = await fetch(`/csv/load/${filename}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(' Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(' Resultado archivo específico:', data);
        showLoading(false);
        
        // Handle the response properly
        if (data.success && data.result) {
            displayResults([{
                filename: filename,
                success: true,
                message: data.result.message || `Archivo ${filename} cargado exitosamente`,
                recordsProcessed: data.result.recordsProcessed || 0
            }]);
            loadDashboardStats(); // Refresh stats
            showAlert(` ${data.result.message || `Archivo ${filename} cargado correctamente`}`, 'success');
        } else if (data.success) {
            // Handle case where success is true but no detailed result
            displayResults([{
                filename: filename,
                success: true,
                message: `Archivo ${filename} procesado exitosamente`,
                recordsProcessed: 0
            }]);
            loadDashboardStats();
            showAlert(` Archivo ${filename} cargado correctamente`, 'success');
        } else {
            // Handle error case
            displayResults([{
                filename: filename,
                success: false,
                error: data.message || 'Error al procesar el archivo'
            }]);
            showAlert(` Error: ${data.message || 'Error al cargar el archivo'}`, 'error');
        }
    } catch (error) {
        console.error(' Error cargando archivo específico:', error);
        showLoading(false);
        displayResults([{
            filename: filename,
            success: false,
            error: error.message
        }]);
        showError('Error de conexión: ' + error.message);
    }
}

async function loadAllCSVFiles() {
    console.log(' Cargando todos los archivos CSV...');
    showLoading(true);
    hideResults();

    try {
        const response = await fetch('/csv/load-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(' Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(' Resultado carga masiva:', data);
        showLoading(false);
        
        if (data.success && data.results && Array.isArray(data.results)) {
            // Process each result to ensure proper format
            const processedResults = data.results.map(result => ({
                filename: result.filename || 'Archivo',
                success: result.success || false,
                message: result.message || (result.success ? 'Cargado exitosamente' : 'Error al cargar'),
                recordsProcessed: result.recordsProcessed || 0,
                error: result.error
            }));
            
            displayResults(processedResults);
            loadDashboardStats(); // Refresh dashboard stats
            
            const successCount = processedResults.filter(r => r.success).length;
            const totalCount = processedResults.length;
            showAlert(` Carga completada: ${successCount}/${totalCount} archivos procesados exitosamente`, 'success');
        } else if (data.success) {
            // Handle case where success is true but no detailed results
            displayResults([{
                filename: 'Carga masiva',
                success: true,
                message: 'Todos los archivos procesados exitosamente',
                recordsProcessed: 0
            }]);
            loadDashboardStats();
            showAlert(' Todos los archivos CSV cargados correctamente', 'success');
        } else {
            // Handle error case
            displayResults([{
                filename: 'Carga masiva',
                success: false,
                error: data.message || 'Error en la carga masiva'
            }]);
            showAlert(` Error: ${data.message || 'Error en la carga masiva'}`, 'error');
        }
    } catch (error) {
        console.error(' Error en carga masiva:', error);
        showLoading(false);
        displayResults([{
            filename: 'Carga masiva',
            success: false,
            error: error.message
        }]);
        showError('Error de conexión: ' + error.message);
    }
}

async function loadSpecificFile(filename) {
    console.log(' Cargando archivo específico:', filename);
    showLoading(true);
    hideResults();

    try {
        const response = await fetch(`/csv/load/${filename}`, {
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
    
    if (!container || !section) {
        console.error(' Results containers not found');
        showAlert('Error: Contenedores de resultados no encontrados', 'error');
        return;
    }
    
    container.innerHTML = '';
    
    if (!Array.isArray(results)) {
        results = [results];
    }
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.success ? 'success' : 'error'}`;
        
        if (result.success) {
            resultItem.innerHTML = `
                <strong> ${result.filename || 'Archivo'}</strong><br>
                ${result.message || 'Cargado exitosamente'}<br>
                <small>Registros procesados: ${result.recordsProcessed || 0}</small>
            `;
        } else {
            resultItem.innerHTML = `
                <strong> ${result.filename || 'Archivo'}</strong><br>
                Error: ${result.error || result.message || 'Error desconocido'}
            `;
        }
        
        container.appendChild(resultItem);
    });
    
    section.classList.add('show');
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const overlay = document.getElementById('loading-overlay');
    
    if (loading) {
        if (show) {
            loading.classList.add('show');
            loading.style.display = 'flex';
        } else {
            loading.classList.remove('show');
            loading.style.display = 'none';
        }
    }
    
    if (overlay) {
        if (show) {
            overlay.classList.add('show');
            overlay.style.display = 'flex';
        } else {
            overlay.classList.remove('show');
            overlay.style.display = 'none';
        }
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

function setupSearchListeners() {
    // Search inputs
    document.querySelectorAll('.search-input').forEach(input => {
        input.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            const list = this.nextElementSibling;
            const items = list.children;
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const text = item.textContent.toLowerCase();
                
                if (text.includes(query)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            }
        });
    });
}

// CLIENTS SECTION
async function loadClients() {
    console.log(' Cargando clientes...');
    showAlert('Cargando clientes...', 'info');
    
    try {
        const response = await fetch('/clients');
        const clients = await response.json();
        
        const clientsList = document.getElementById('clients-list');
        clientsList.innerHTML = '';
        
        clients.forEach(client => {
            const clientItem = document.createElement('div');
            clientItem.className = 'data-item';
            clientItem.innerHTML = `
                <div class="data-info">
                    <h4>${client.name_client || client.name || 'Sin nombre'}</h4>
                    <p>ID: ${client.identificacion || client.id || 'N/A'}</p>
                    <p>Email: ${client.email || 'N/A'}</p>
                    <p>Teléfono: ${client.phone || 'N/A'}</p>
                    <p>Dirección: ${client.address || 'N/A'}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editClient('${client.identificacion || client.id}')">Editar</button>
                    <button class="btn-delete" onclick="deleteClient('${client.identificacion || client.id}')">Eliminar</button>
                </div>
            `;
            clientsList.appendChild(clientItem);
        });
        
        showAlert(`${clients.length} clientes cargados correctamente`, 'success');
    } catch (error) {
        console.error('Error cargando clientes:', error);
        showAlert('Error al cargar clientes: ' + error.message, 'error');
    }
}

function addClient() {
    const modal = document.getElementById('client-modal');
    const form = document.getElementById('client-form');
    const title = modal.querySelector('h3');
    
    title.textContent = 'Agregar Cliente';
    form.reset();
    form.onsubmit = saveClient;
    modal.style.display = 'block';
}

async function editClient(id) {
    try {
        const response = await fetch(`/clients/${id}`);
        const client = await response.json();
        
        const modal = document.getElementById('client-modal');
        const form = document.getElementById('client-form');
        const title = modal.querySelector('h3');
        
        title.textContent = 'Editar Cliente';
        document.getElementById('client-name').value = client.name_client || client.name || '';
        document.getElementById('client-identificacion').value = client.identificacion || client.id || '';
        document.getElementById('client-email').value = client.email || '';
        document.getElementById('client-phone').value = client.phone || '';
        document.getElementById('client-address').value = client.address || '';
        
        form.onsubmit = (e) => saveClient(e, id);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error cargando cliente:', error);
        showAlert('Error al cargar cliente: ' + error.message, 'error');
    }
}

async function saveClient(event, id = null) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const clientData = {
        name_client: formData.get('name') || formData.get('name_client'),
        identificacion: formData.get('identificacion') || formData.get('id'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address')
    };
    
    try {
        const url = id ? `/clients/${id}` : '/clients';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        });
        
        if (response.ok) {
            closeModal('client-modal');
            loadClients();
            showAlert(id ? 'Cliente actualizado correctamente' : 'Cliente agregado correctamente', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error guardando cliente:', error);
        showAlert('Error al guardar cliente: ' + error.message, 'error');
    }
}

async function deleteClient(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        try {
            const response = await fetch(`/clients/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadClients();
                showAlert('Cliente eliminado correctamente', 'success');
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            showAlert('Error al eliminar cliente: ' + error.message, 'error');
        }
    }
}

// TRANSACTIONS SECTION
async function loadTransactions() {
    console.log(' Cargando transacciones...');
    showAlert('Cargando transacciones...', 'info');
    
    try {
        const response = await fetch('/transactions');
        const transactions = await response.json();
        
        const transactionsList = document.getElementById('transactions-list');
        transactionsList.innerHTML = '';
        
        transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'data-item';
            transactionItem.innerHTML = `
                <div class="data-info">
                    <h4>Transacción #${transaction.id_transaction || transaction.id || 'N/A'}</h4>
                    <p>Tipo: ${transaction.transaction_type || 'N/A'}</p>
                    <p>Fecha: ${transaction.date_and_time ? new Date(transaction.date_and_time).toLocaleDateString() : 'N/A'}</p>
                    <p>Monto: $${transaction.amount || '0.00'}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editTransaction('${transaction.id_transaction || transaction.id}')">Editar</button>
                    <button class="btn-delete" onclick="deleteTransaction('${transaction.id_transaction || transaction.id}')">Eliminar</button>
                </div>
            `;
            transactionsList.appendChild(transactionItem);
        });
        
        showAlert(`${transactions.length} transacciones cargadas correctamente`, 'success');
    } catch (error) {
        console.error('Error cargando transacciones:', error);
        showAlert('Error al cargar transacciones: ' + error.message, 'error');
    }
}

function addTransaction() {
    const modal = document.getElementById('transaction-modal');
    const form = document.getElementById('transaction-form');
    const title = modal.querySelector('h3');
    
    title.textContent = 'Agregar Transacción';
    form.reset();
    form.onsubmit = saveTransaction;
    modal.style.display = 'block';
}

async function editTransaction(id) {
    try {
        const response = await fetch(`/transactions/${id}`);
        const transaction = await response.json();
        
        const modal = document.getElementById('transaction-modal');
        const form = document.getElementById('transaction-form');
        const title = modal.querySelector('h3');
        
        title.textContent = 'Editar Transacción';
        document.getElementById('transaction-client-id').value = transaction.client_id;
        document.getElementById('transaction-type').value = transaction.transaction_type;
        document.getElementById('transaction-date').value = transaction.date_and_time.split('T')[0];
        document.getElementById('transaction-amount').value = transaction.amount;
        
        form.onsubmit = (e) => saveTransaction(e, id);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error cargando transacción:', error);
        showAlert('Error al cargar transacción: ' + error.message, 'error');
    }
}

async function saveTransaction(event, id = null) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const transactionData = {
        id_transaction: formData.get('id_transaction') || `TXN-${Date.now()}`,
        date_and_time: formData.get('transaction_date') || formData.get('date_and_time'),
        amount: parseFloat(formData.get('amount')),
        transaction_type: formData.get('transaction_type')
    };
    
    try {
        const url = id ? `/transactions/${id}` : '/transactions';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        
        if (response.ok) {
            closeModal('transaction-modal');
            loadTransactions();
            showAlert(id ? 'Transacción actualizada correctamente' : 'Transacción agregada correctamente', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error guardando transacción:', error);
        showAlert('Error al guardar transacción: ' + error.message, 'error');
    }
}

async function deleteTransaction(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        try {
            const response = await fetch(`/transactions/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadTransactions();
                showAlert('Transacción eliminada correctamente', 'success');
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error eliminando transacción:', error);
            showAlert('Error al eliminar transacción: ' + error.message, 'error');
        }
    }
}

// INVOICES SECTION
async function loadInvoices() {
    console.log(' Cargando facturas...');
    showAlert('Cargando facturas...', 'info');
    
    try {
        const response = await fetch('/invoices');
        const invoices = await response.json();
        
        const invoicesList = document.getElementById('invoices-list');
        invoicesList.innerHTML = '';
        
        invoices.forEach(invoice => {
            const invoiceItem = document.createElement('div');
            invoiceItem.className = 'data-item';
            invoiceItem.innerHTML = `
                <div class="data-info">
                    <h4>Factura #${invoice.invoice_number || invoice.id || 'N/A'}</h4>
                    <p>Plataforma: ${invoice.platform || 'N/A'}</p>
                    <p>Período: ${invoice.billing_period || 'N/A'}</p>
                    <p>Monto Facturado: $${invoice.invoiced_amount || '0.00'}</p>
                    <p>Monto Pagado: $${invoice.amount_paid || '0.00'}</p>
                    <p>Cliente ID: ${invoice.identificacion || 'N/A'}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editInvoice(${invoice.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteInvoice(${invoice.id})">Eliminar</button>
                </div>
            `;
            invoicesList.appendChild(invoiceItem);
        });
        
        showAlert(`${invoices.length} facturas cargadas correctamente`, 'success');
    } catch (error) {
        console.error('Error cargando facturas:', error);
        showAlert('Error al cargar facturas: ' + error.message, 'error');
    }
}

function addInvoice() {
    const modal = document.getElementById('invoice-modal');
    const form = document.getElementById('invoice-form');
    const title = modal.querySelector('h3');
    
    title.textContent = 'Agregar Factura';
    form.reset();
    form.onsubmit = saveInvoice;
    modal.style.display = 'block';
}

async function editInvoice(id) {
    try {
        const response = await fetch(`/invoices/${id}`);
        const invoice = await response.json();
        
        const modal = document.getElementById('invoice-modal');
        const form = document.getElementById('invoice-form');
        const title = modal.querySelector('h3');
        
        title.textContent = 'Editar Factura';
        document.getElementById('invoice-number').value = invoice.invoice_number || '';
        document.getElementById('invoice-platform').value = invoice.platform || '';
        document.getElementById('invoice-period').value = invoice.billing_period || '';
        document.getElementById('invoice-amount').value = invoice.invoiced_amount || '';
        document.getElementById('invoice-paid').value = invoice.amount_paid || '';
        document.getElementById('invoice-client-id').value = invoice.identificacion || '';
        document.getElementById('invoice-transaction-id').value = invoice.id_transaction || '';
        
        form.onsubmit = (e) => saveInvoice(e, id);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error cargando factura:', error);
        showAlert('Error al cargar factura: ' + error.message, 'error');
    }
}

async function saveInvoice(event, id = null) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const invoiceData = {
        invoice_number: formData.get('invoice_number') || `INV-${Date.now()}`,
        platform: formData.get('platform'),
        billing_period: formData.get('billing_period'),
        invoiced_amount: parseFloat(formData.get('invoiced_amount') || formData.get('total_amount')),
        amount_paid: parseFloat(formData.get('amount_paid') || 0),
        identificacion: formData.get('client_id') || formData.get('identificacion'),
        id_transaction: formData.get('id_transaction')
    };
    
    try {
        const url = id ? `/invoices/${id}` : '/invoices';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        });
        
        if (response.ok) {
            closeModal('invoice-modal');
            loadInvoices();
            showAlert(id ? 'Factura actualizada correctamente' : 'Factura agregada correctamente', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error guardando factura:', error);
        showAlert('Error al guardar factura: ' + error.message, 'error');
    }
}

async function deleteInvoice(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
        try {
            const response = await fetch(`/invoices/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadInvoices();
                showAlert('Factura eliminada correctamente', 'success');
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error eliminando factura:', error);
            showAlert('Error al eliminar factura: ' + error.message, 'error');
        }
    }
}

// STATES SECTION
async function loadStates() {
    console.log(' Cargando estados...');
    showAlert('Cargando estados...', 'info');
    
    try {
        const response = await fetch('/transaction-states');
        const states = await response.json();
        
        const statesList = document.getElementById('states-list');
        statesList.innerHTML = '';
        
        states.forEach(state => {
            const stateItem = document.createElement('div');
            stateItem.className = 'data-item';
            stateItem.innerHTML = `
                <div class="data-info">
                    <h4>Estado #${state.id || 'N/A'}</h4>
                    <p>Estado: ${state.transaction_status || state.status || 'N/A'}</p>
                    <p>Fecha: ${state.created_at ? new Date(state.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editState(${state.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteState(${state.id})">Eliminar</button>
                </div>
            `;
            statesList.appendChild(stateItem);
        });
        
        showAlert(`${states.length} estados cargados correctamente`, 'success');
    } catch (error) {
        console.error('Error cargando estados:', error);
        showAlert('Error al cargar estados: ' + error.message, 'error');
    }
}

function addState() {
    const modal = document.getElementById('state-modal');
    const form = document.getElementById('state-form');
    const title = modal.querySelector('h3');
    
    title.textContent = 'Agregar Estado';
    form.reset();
    form.onsubmit = saveState;
    modal.style.display = 'block';
}

async function editState(id) {
    try {
        const response = await fetch(`/transaction-states/${id}`);
        const state = await response.json();
        
        const modal = document.getElementById('state-modal');
        const form = document.getElementById('state-form');
        const title = modal.querySelector('h3');
        
        title.textContent = 'Editar Estado';
        document.getElementById('state-transaction-id').value = state.transaction_id;
        document.getElementById('state-state').value = state.state;
        document.getElementById('state-date').value = state.state_date.split('T')[0];
        document.getElementById('state-comments').value = state.comments || '';
        
        form.onsubmit = (e) => saveState(e, id);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error cargando estado:', error);
        showAlert('Error al cargar estado: ' + error.message, 'error');
    }
}

async function saveState(event, id = null) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const stateData = {
        transaction_id: parseInt(formData.get('transaction_id')),
        state: formData.get('state'),
        state_date: formData.get('state_date'),
        comments: formData.get('comments')
    };
    
    try {
        const url = id ? `/transaction-states/${id}` : '/transaction-states';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stateData)
        });
        
        if (response.ok) {
            closeModal('state-modal');
            loadStates();
            showAlert(id ? 'Estado actualizado correctamente' : 'Estado agregado correctamente', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error guardando estado:', error);
        showAlert('Error al guardar estado: ' + error.message, 'error');
    }
}

async function deleteState(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este estado?')) {
        try {
            const response = await fetch(`/transaction-states/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadStates();
                showAlert('Estado eliminado correctamente', 'success');
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error eliminando estado:', error);
            showAlert('Error al eliminar estado: ' + error.message, 'error');
        }
    }
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showAlert(message, type = 'info') {
    // Create alert element if it doesn't exist
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(alertContainer);
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    `;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for alerts
if (!document.getElementById('alert-styles')) {
    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
