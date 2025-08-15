import cors from "cors"
import express from "express"
import path from "path"
import { pool } from "./server/conexiondb.js"
import { loadAllCSVFiles, loadSpecificCSV, getAvailableCSVFiles } from "./server/seeders/csvLoader.js"

const app = express()
app.use(cors()) // esto permite que la aplicacion backend pueda ser consumidentificaciona por una aplicacion frontend
app.use(express.json()) // permite que Express interprete automáticamente el body en JSON cuando recibes una petición POST o PUT.

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'))

// Ruta principal para servir el Dashboard (ya no CSV Loader)
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'dashboard.html'));
});

// Ruta alternativa para el CSV Loader (mantener por compatibilidad)
app.get('/csv-loader', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Ruta para el Dashboard CRUD
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'dashboard.html'));
});

// CLIENTS ENDPOINTS - Updated to match actual database
app.get('/clients', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clients');
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.get('/clients/:identificacion', async (req, res) => {
    try {
        const { identificacion } = req.params;
        const [rows] = await pool.query('SELECT * FROM clients WHERE identificacion = ?', [identificacion]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.post('/clients', async (req, res) => {
    try {
        const { name_client, identificacion, address, phone, email } = req.body;
        const query = 'INSERT INTO clients (name_client, identificacion, address, phone, email) VALUES (?, ?, ?, ?, ?)';
        const values = [name_client, identificacion, address, phone, email];
        
        await pool.query(query, values);
        res.status(201).json({ mensaje: "Cliente creado exitosamente" });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.put('/clients/:identificacion', async (req, res) => {
    try {
        const { identificacion } = req.params;
        const { name_client, address, phone, email } = req.body;
        const query = 'UPDATE clients SET name_client = ?, address = ?, phone = ?, email = ? WHERE identificacion = ?';
        const values = [name_client, address, phone, email, identificacion];
        
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            res.json({ mensaje: "Cliente actualizado exitosamente" });
        } else {
            res.status(404).json({ mensaje: "Cliente no encontrado" });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.delete('/clients/:identificacion', async (req, res) => {
    try {
        const { identificacion } = req.params;
        const [result] = await pool.query('DELETE FROM clients WHERE identificacion = ?', [identificacion]);
        
        if (result.affectedRows > 0) {
            res.json({ mensaje: "Cliente eliminado exitosamente" });
        } else {
            res.status(404).json({ mensaje: "Cliente no encontrado" });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// TRANSACTIONS ENDPOINTS - Updated to match actual database
app.get('/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM transactions');
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.get('/transactions/:id_transaction', async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const [rows] = await pool.query('SELECT * FROM transactions WHERE id_transaction = ?', [id_transaction]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.post('/transactions', async (req, res) => {
    try {
        const { id_transaction, date_and_time, amount, transaction_type } = req.body;
        const query = 'INSERT INTO transactions (id_transaction, date_and_time, amount, transaction_type) VALUES (?, ?, ?, ?)';
        const values = [id_transaction, date_and_time, amount, transaction_type];
        
        await pool.query(query, values);
        res.status(201).json({ mensaje: "Transacción creada exitosamente" });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.put('/transactions/:id_transaction', async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const { date_and_time, amount, transaction_type } = req.body;
        const query = 'UPDATE transactions SET date_and_time = ?, amount = ?, transaction_type = ? WHERE id_transaction = ?';
        const values = [date_and_time, amount, transaction_type, id_transaction];
        
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            res.json({ mensaje: "Transacción actualizada exitosamente" });
        } else {
            res.status(404).json({ mensaje: "Transacción no encontrada" });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.delete('/transactions/:id_transaction', async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const [result] = await pool.query('DELETE FROM transactions WHERE id_transaction = ?', [id_transaction]);
        
        if (result.affectedRows > 0) {
            res.json({ mensaje: "Transacción eliminada exitosamente" });
        } else {
            res.status(404).json({ mensaje: "Transacción no encontrada" });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// INVOICES ENDPOINTS - Updated to match actual database
app.get('/invoices', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                i.*,
                c.name_client,
                t.transaction_type
            FROM invoices i
            LEFT JOIN clients c ON i.identificacion = c.identificacion
            LEFT JOIN transactions t ON i.id_transaction = t.id_transaction
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.get('/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.post('/invoices', async (req, res) => {
    try {
        const { invoice_number, platform, billing_period, invoiced_amount, amount_paid, identificacion, id_transaction } = req.body;
        const query = 'INSERT INTO invoices (invoice_number, platform, billing_period, invoiced_amount, amount_paid, identificacion, id_transaction) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [invoice_number, platform, billing_period, invoiced_amount, amount_paid, identificacion, id_transaction];
        
        await pool.query(query, values);
        res.status(201).json({ mensaje: "Factura creada exitosamente" });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.put('/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { platform, billing_period, invoiced_amount, amount_paid, identificacion, id_transaction } = req.body;
        const query = 'UPDATE invoices SET platform = ?, billing_period = ?, invoiced_amount = ?, amount_paid = ?, identificacion = ?, id_transaction = ? WHERE id = ?';
        const values = [platform, billing_period, invoiced_amount, amount_paid, identificacion, id_transaction, id];
        
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            res.json({ mensaje: "Factura actualizada exitosamente" });
        } else {
            res.status(404).json({ mensaje: "Factura no encontrada" });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.delete('/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            res.json({ mensaje: "Factura eliminada exitosamente" });
        } else {
            res.status(404).json({ mensaje: "Factura no encontrada" });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// TRANSACTION STATES ENDPOINTS - Updated to match actual database
app.get('/transaction-states', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM transaction_states');
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.get('/transaction-states/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM transaction_states WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.post('/transaction-states', async (req, res) => {
    try {
        const { transaction_status } = req.body;
        const query = 'INSERT INTO transaction_states (transaction_status) VALUES (?)';
        const values = [transaction_status];
        
        await pool.query(query, values);
        res.status(201).json({ mensaje: "Estado creado exitosamente" });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.put('/transaction-states/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { transaction_status } = req.body;
        const query = 'UPDATE transaction_states SET transaction_status = ? WHERE id = ?';
        const values = [transaction_status, id];
        
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            res.json({ mensaje: "Estado actualizado exitosamente" });
        } else {
            res.status(404).json({ mensaje: "Estado no encontrado" });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.delete('/transaction-states/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM transaction_states WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            res.json({ mensaje: "Estado eliminado exitosamente" });
        } else {
            res.status(404).json({ mensaje: "Estado no encontrado" });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// CSV Loading Endpoints
app.get('/csv/available', (req, res) => {
    try {
        const files = getAvailableCSVFiles();
        res.json({
            success: true,
            files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/csv/load-all', async (req, res) => {
    try {
        const results = await loadAllCSVFiles();
        res.json({
            success: true,
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/csv/load/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const result = await loadSpecificCSV(filename);
        res.json({
            success: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/csv/clear-and-reload/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Mapping of filenames to table names
        const tableMapping = {
            'client.csv': 'clients',
            'transaction.csv': 'transactions',
            'invoiced.csv': 'invoices',
            'state.csv': 'transaction_states'
        };
        
        const tableName = tableMapping[filename];
        if (!tableName) {
            throw new Error(`Tabla no encontrada para el archivo: ${filename}`);
        }
        
        // Clear existing data
        await pool.query(`DELETE FROM ${tableName}`);
        
        // Reload CSV data
        const result = await loadSpecificCSV(filename);
        
        res.json({
            success: true,
            message: `Tabla ${tableName} limpiada y recargada exitosamente`,
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//Inicio del servidor cuando este todo listo
app.listen(3000, () => {
    console.log("🚀 Servidor preparado correctamente!");
    console.log("📊 Dashboard Principal: http://localhost:3000");
    console.log("🔗 API Endpoints disponibles:");
    console.log("   - GET  /clients");
    console.log("   - GET  /transactions");
    console.log("   - GET  /invoices");
    console.log("   - GET  /transaction-states");
    console.log("   - POST /csv/load-all");
    console.log("   - POST /csv/load/:filename");
    console.log("   - POST /csv/clear-and-reload/:filename");
    console.log("✅ ¡Dashboard listo para usar!");
});