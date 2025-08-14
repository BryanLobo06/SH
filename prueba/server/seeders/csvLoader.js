import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { pool } from '../conexiondb.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');

// Función para limpiar y validar datos
function cleanData(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    // Limpiar espacios en blanco
    if (typeof value === 'string') {
        return value.trim();
    }
    return value;
}

// Función para leer y procesar archivos CSV
async function loadCSVFile(filename, tableName, columnMapping) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(DATA_DIR, filename);
        const results = [];
        
        if (!fs.existsSync(filePath)) {
            reject(new Error(`Archivo ${filename} no encontrado`));
            return;
        }

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Mapear columnas del CSV a columnas de la base de datos
                const mappedData = {};
                Object.keys(columnMapping).forEach(csvCol => {
                    const dbCol = columnMapping[csvCol];
                    // Limpiar y validar los datos
                    mappedData[dbCol] = cleanData(data[csvCol]);
                });
                results.push(mappedData);
            })
            .on('end', async () => {
                try {
                    await insertDataToTable(tableName, results);
                    resolve({
                        success: true,
                        filename,
                        recordsProcessed: results.length,
                        message: `${results.length} registros cargados exitosamente en ${tableName}`
                    });
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Función para insertar datos en la tabla
async function insertDataToTable(tableName, data) {
    if (data.length === 0) return;

    const columns = Object.keys(data[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        for (const row of data) {
            const values = columns.map(col => {
                const value = row[col];
                // Asegurar que no hay valores undefined
                return value === undefined ? null : value;
            });
            await connection.execute(query, values);
        }
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Configuración de mapeo de columnas para cada archivo CSV
const CSV_MAPPINGS = {
    'client.csv': {
        tableName: 'clients',
        columnMapping: {
            'name_client': 'name_client',
            'identificación': 'identificacion',
            'address': 'address',
            'phone': 'phone',
            'email': 'email'
        }
    },
    'transaction.csv': {
        tableName: 'transactions',
        columnMapping: {
            'id_transaction': 'id_transaction',
            'date_and_time': 'date_and_time',
            'amount': 'amount',
            'transaction_type': 'transaction_type'
        }
    },
    'invoiced.csv': {
        tableName: 'invoices',
        columnMapping: {
            'invoice_numbe': 'invoice_number',
            'platform': 'platform',
            'billing_period': 'billing_period',
            'invoiced_amount': 'invoiced_amount',
            'amount_paid': 'amount_paid',
            'identificacion': 'identificacion',
            'id_transaction': 'id_transaction'
        }
    },
    'state.csv': {
        tableName: 'transaction_states',
        columnMapping: {
            'transaction_status': 'transaction_status'
        }
    }
};

// Función principal para cargar todos los archivos CSV
export async function loadAllCSVFiles() {
    const results = [];
    
    for (const [filename, config] of Object.entries(CSV_MAPPINGS)) {
        try {
            const result = await loadCSVFile(filename, config.tableName, config.columnMapping);
            results.push(result);
        } catch (error) {
            results.push({
                success: false,
                filename,
                error: error.message
            });
        }
    }
    
    return results;
}

// Función para cargar un archivo específico
export async function loadSpecificCSV(filename) {
    const config = CSV_MAPPINGS[filename];
    
    if (!config) {
        throw new Error(`Configuración no encontrada para el archivo: ${filename}`);
    }
    
    return await loadCSVFile(filename, config.tableName, config.columnMapping);
}

// Función para obtener la lista de archivos CSV disponibles
export function getAvailableCSVFiles() {
    return Object.keys(CSV_MAPPINGS).map(filename => ({
        filename,
        tableName: CSV_MAPPINGS[filename].tableName,
        exists: fs.existsSync(path.join(DATA_DIR, filename))
    }));
}
