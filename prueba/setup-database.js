import { pool } from './server/conexiondb.js';
import fs from 'fs';

const setupDatabase = async () => {
    try {
        console.log('🔧 Configurando base de datos...');

        // Crear tabla clients
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name_client VARCHAR(255) NOT NULL,
                identificacion VARCHAR(50) UNIQUE NOT NULL,
                address TEXT,
                phone VARCHAR(50),
                email VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla clients creada');

        // Crear tabla transactions
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_transaction VARCHAR(50) UNIQUE NOT NULL,
                date_and_time DATETIME NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                transaction_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla transactions creada');

        // Crear tabla invoices
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                platform VARCHAR(100),
                billing_period VARCHAR(20),
                invoiced_amount DECIMAL(10,2),
                amount_paid DECIMAL(10,2),
                identificacion VARCHAR(50),
                id_transaction VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla invoices creada');

        // Crear tabla transaction_states
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS transaction_states (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_status VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla transaction_states creada');

        // Crear índices
        try {
            await pool.execute('CREATE INDEX idx_clients_identificacion ON clients(identificacion)');
        } catch (e) { /* Índice ya existe */ }
        
        try {
            await pool.execute('CREATE INDEX idx_transactions_id ON transactions(id_transaction)');
        } catch (e) { /* Índice ya existe */ }

        console.log('🎉 ¡Base de datos configurada exitosamente!');
        console.log('📋 Tablas creadas:');
        
        const [tables] = await pool.execute('SHOW TABLES');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error.message);
        process.exit(1);
    }
};

setupDatabase();
