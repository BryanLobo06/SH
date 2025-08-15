# Sistema de Gestión ExpertSoft

Un sistema completo de gestión empresarial con funcionalidades CRUD para clientes, transacciones y facturas. Desarrollado con Node.js, Express, MySQL y interfaz web moderna.

## 🚀 Características

- **Sistema CRUD completo** para gestión de clientes, transacciones y facturas
- **Carga masiva de datos** desde archivos CSV
- **API RESTful** con endpoints documentados
- **Base de datos MySQL** con esquema optimizado
- **Interfaz web moderna** con JavaScript vanilla
- **Dashboard interactivo** con navegación por pestañas
- **Validación de datos** y manejo de errores

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
   - Crear la base de datos ejecutando el script SQL

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

## 🌐 Interfaz Web

- **Dashboard Principal**: `http://localhost:3000/` - Sistema completo de gestión con:
  - **Clientes**: Gestión CRUD de información de clientes
  - **Transacciones**: Registro y seguimiento de transacciones
  - **Facturas**: Administración de facturación
  - **Carga CSV**: Importación masiva de datos

## 📡 API Endpoints

### Gestión de Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/clients` | Listar todos los clientes |
| `GET` | `/api/clients/:id` | Obtener cliente específico |
| `POST` | `/api/clients` | Crear nuevo cliente |
| `PUT` | `/api/clients/:id` | Actualizar cliente |
| `DELETE` | `/api/clients/:id` | Eliminar cliente |

### Gestión de Transacciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/transactions` | Listar todas las transacciones |
| `GET` | `/api/transactions/:id` | Obtener transacción específica |
| `POST` | `/api/transactions` | Crear nueva transacción |
| `PUT` | `/api/transactions/:id` | Actualizar transacción |
| `DELETE` | `/api/transactions/:id` | Eliminar transacción |

### Gestión de Facturas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/invoices` | Listar todas las facturas |
| `GET` | `/api/invoices/:id` | Obtener factura específica |
| `POST` | `/api/invoices` | Crear nueva factura |
| `PUT` | `/api/invoices/:id` | Actualizar factura |
| `DELETE` | `/api/invoices/:id` | Eliminar factura |

### Carga de CSV

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/csv/available` | Archivos CSV disponibles |
| `POST` | `/api/csv/load-all` | Cargar todos los CSV |
| `POST` | `/api/csv/load/:filename` | Cargar CSV específico |

## 📊 Estructura de Base de Datos

### Tablas Principales

- **clients**: Información de clientes del sistema
- **transactions**: Registro de transacciones comerciales
- **invoices**: Facturas y información de facturación
- **states**: Estados y configuraciones del sistema

### Ejemplo de Datos

#### Cliente
```json
{
  "id_client": "CLI001",
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phone": "123456789",
  "address": "Calle 123"
}
```

#### Transacción
```json
{
  "id_transaction": "TXN001",
  "transaction_type": "venta",
  "date_and_time": "2024-01-15T10:30:00",
  "amount": 150.00
}
```

#### Factura
```json
{
  "id_invoiced": "INV001",
  "platform": "Web",
  "billing_period": "2024-01",
  "total_amount": 1500.00,
  "status": "paid"
}
```

## 📁 Estructura del Proyecto

```
prueba/
├── docs/
│   ├── expertSoft.sql           # Esquema de base de datos
│   └── Diagrama entidad-relacion.drawio.png
├── public/
│   ├── index.html               # Interfaz principal
│   ├── script.js                # Lógica frontend
│   └── styles.css               # Estilos CSS
├── server/
│   ├── conexiondb.js            # Configuración de BD
│   ├── data/                    # Archivos CSV
│   │   ├── client.csv
│   │   ├── invoiced.csv
│   │   ├── state.csv
│   │   └── transaction.csv
│   └── seeders/
│       └── csvLoader.js         # Cargador de datos CSV
├── index.js                     # Servidor principal
├── setup-database.js            # Inicializador de BD
├── package.json                 # Dependencias
└── .env                         # Variables de entorno
```

## 🔧 Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL2
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Utilidades**: CSV-Parser, CORS, dotenv

## 📝 Funcionalidades Principales

### Dashboard Interactivo
- **Navegación por pestañas**: Clientes, Transacciones, Facturas, CSV
- **Formularios dinámicos**: Crear y editar registros
- **Tablas responsivas**: Visualización de datos con acciones CRUD
- **Alertas del sistema**: Notificaciones de éxito y error

### Carga Masiva CSV
- **Detección automática**: Archivos CSV disponibles
- **Carga individual**: Por archivo específico
- **Carga masiva**: Todos los archivos a la vez
- **Validación de datos**: Verificación antes de insertar

### API RESTful
- **Endpoints consistentes**: Estructura uniforme
- **Manejo de errores**: Respuestas HTTP apropiadas
- **Validación de entrada**: Verificación de datos
- **CORS habilitado**: Acceso desde diferentes dominios

