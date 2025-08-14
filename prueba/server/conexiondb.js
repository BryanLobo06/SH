import dotenv from "dotenv";
import mysql from "mysql2/promise"

dotenv.config();  // Cargar variables de .env

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 10,        // Máximo número de conexiones activas al mismo tiempo
    waitForConnections: true,   // Si se alcanza el límite, las nuevas peticiones esperan su turno
    queueLimit: 0               // Número máximo de peticiones en espera (0 = sin límite)
})

/**
 * Función para probar la conexión con la base de datos.
 * Realiza una consulta simple para verificar que la conexión funciona.
 * 
 * @returns {boolean} True si la conexión es exitosa, false en caso de error.
 */
export async function probarConexionConLaBaseDeDatos() {
    try {
        console.log('🔍 Probando conexión a la base de datos...');
        
        const connection = await pool.getConnection();
        
        // Realizar una consulta simple para verificar que la conexión funciona
        const [rows] = await connection.execute('SELECT 1 as test');
        
        if (rows && rows[0] && rows[0].test === 1) {
            console.log('✅ Conexión a la base de datos exitosa');
            console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
            console.log(`🏠 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        }
        
        connection.release();
        return true;
        
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        console.error('🔧 Verifica tu configuración en el archivo .env');
        return false;
    }
}

probarConexionConLaBaseDeDatos();