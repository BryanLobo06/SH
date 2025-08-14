# Sistema de Gestión de expertSoft

Un sistema completo de gestión de expertSoft con funcionalidades CRUD y carga masiva de datos CSV. Desarrollado con Node.js, Express, MySQL y Vite.

## 🚀 Características

- **Sistema CRUD completo** para gestión de préstamos
- **Carga masiva de datos** desde archivos CSV
- **API RESTful** con endpoints documentados
- **Base de datos MySQL** con esquema optimizado
- **Interfaz web moderna** con Vite
- **Consultas especializadas** para reportes

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd prueba
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   - Crear la base de datos ejecutando el script SQL:
   ```bash
   mysql -u tu_usuario -p < docs/expertSoft.sql
   ```

4. **Configurar variables de entorno**
   - Crear archivo `.env` con:
   ```env
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=expertSoft
   PORT=3000
   ```

5. **Inicializar la base de datos** (opcional)
   ```bash
   node setup-database.js
   ```

## 🚦 Uso

### Desarrollo
```bash
node index.js
```


El servidor estará disponible en: `http://localhost:3000`

## 🌐 Interfaces Web

- **CSV Loader**: `http://localhost:3000/` - Interfaz para carga masiva de datos
- **Dashboard CRUD**: `http://localhost:3000/dashboard` - Panel de administración

## 📡 API Endpoints

### Gestión de Préstamos (CRUD)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/client` | Listar todos los préstamos |
| `GET` | `/client/:identificacion` | Obtener préstamo específico |
| `POST` | `/client` | Crear nuevo préstamo |
| `PUT` | `/client/:identificacion_client` | Actualizar préstamo |
| `DELETE` | `/client/:identificacion_client` | Eliminar préstamo |

### Consultas Especializadas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/client/usuario/:identificacion` | Préstamos de un usuario específico |
| `GET` | `/invoiced/mas-invoiced` | Top 5 libros más prestados |
| `GET` | `/transaction/con-retrasos` | Usuarios con préstamos retrasados |
| `GET` | `/client/activos` | Préstamos activos |
| `GET` | `/client/historial/:isbn` | Historial de un libro por ISBN |

### Carga de CSV

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/csv/available` | Archivos CSV disponibles |
| `POST` | `/csv/load-all` | Cargar todos los CSV |
| `POST` | `/csv/load/:filename` | Cargar CSV específico |

## 📊 Estructura de Base de Datos

### Tablas Principales

- **clients**: Información de clientes
- **transactions**: Registro de transacciones
- **invoices**: Facturas del sistema
- **transaction_states**: Estados de transacciones

### Ejemplo de Datos para Préstamos

```json
{
  "identificacion_usuario": "12345678",
  "isbn": "978-0123456789",
  "fecha_client": "2024-01-15",
  "fecha_devolucion": "2024-02-15",
  "estado": "activo"
}
```

## 📁 Estructura del Proyecto

```
prueba/
├── docs/
│   └── expertSoft.sql      # Esquema de base de datos
├── public/
│   ├── index.html          # Interfaz CSV Loader
│   ├── dashboard.html      # Dashboard CRUD
│   ├── script.js           # Lógica frontend
│   └── styles.css          # Estilos
├── server/
│   ├── conexiondb.js       # Configuración de BD
│   ├── data/               # Archivos CSV
│   └── seeders/            # Cargadores de datos
├── index.js                # Servidor principal
├── setup-database.js       # Inicializador de BD
├── package.json            # Dependencias
└── .env                    # Variables de entorno
```

## 🔧 Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL2
- **Frontend**: HTML, CSS, JavaScript, Vite
- **Utilidades**: CSV-Parser, CORS, dotenv

