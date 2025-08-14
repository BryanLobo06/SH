CREATE DATABASE expertSoft;
USE expertSoft;


-- Script SQL para crear las tablas necesarias para el CSV Loader
-- Ejecuta este script en tu base de datos MySQL antes de cargar los CSV

-- Tabla para clientes (client.csv)
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_client VARCHAR(255) NOT NULL,
    identificacion VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para transacciones (transaction.csv)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_transaction VARCHAR(50) UNIQUE NOT NULL,
    date_and_time DATETIME NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para facturas (invoiced.csv)
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    platform VARCHAR(100),
    billing_period VARCHAR(20),
    invoiced_amount DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    identificacion VARCHAR(50),
    id_transaction VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (identificacion) REFERENCES clients(identificacion) ON DELETE SET NULL,
    FOREIGN KEY (id_transaction) REFERENCES transactions(id_transaction) ON DELETE SET NULL
);

-- Tabla para estados de transacciones (state.csv)
CREATE TABLE IF NOT EXISTS transaction_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_status VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


