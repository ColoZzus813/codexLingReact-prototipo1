# CodexLing React + API REST

Proyecto React con Vite y backend REST en Node.js + Express para administrar cursos y usuarios.

## Requisitos

- Node.js 20 o superior
- npm

## Instalacion

```bash
npm install
```

Crea un archivo `.env` tomando como base `.env.example` si quieres cambiar el puerto o el origen permitido por CORS.

## Configuración de Judge0

Para habilitar la funcionalidad de compilador de código:

1. Regístrate en [RapidAPI](https://rapidapi.com/) y obtén una API key para Judge0
2. Copia `.env.example` a `.env`
3. Agrega tu API key: `JUDGE0_API_KEY=tu-api-key-aqui`

## Scripts

```bash
npm run dev
```

Ejecuta el frontend en Vite.

```bash
npm run dev:server
```

Ejecuta el backend con recarga automatica.

```bash
npm run server
```

Ejecuta el backend sin modo watch.

```bash
npm run test:api
```

Ejecuta una prueba automatizada de cursos y usuarios.

## Backend

La API corre por defecto en:

```text
http://localhost:3001/api
```

Estructura principal:

```text
server/
  app.js
  index.js
  config/
  controllers/
  data/
  docs/
  middlewares/
  models/
  routes/
  utils/
```

La base de datos basica se guarda en `server/data/database.json`. La capa de acceso esta en `server/models/courseModel.js`, por lo que se puede cambiar despues por MongoDB, MySQL o SQLite sin alterar controladores y rutas.

## Endpoints

### Health check

```http
GET /api/health
```

Respuesta:

```json
{
  "status": "ok",
  "service": "codexling-api",
  "database": "connected"
}
```

### Listar cursos

```http
GET /api/courses
```

### Obtener un curso

```http
GET /api/courses/:id
```

### Crear un curso

```http
POST /api/courses
Content-Type: application/json
```

Body:

```json
{
  "title": "JAVASCRIPT",
  "icon": "fab fa-js",
  "description": "Frontend, backend y logica web",
  "page": "javascript",
  "type": "javascript"
}
```

### Actualizar un curso

```http
PUT /api/courses/:id
Content-Type: application/json
```

Body:

```json
{
  "description": "Backend, frontend y bases de datos"
}
```

### Eliminar un curso

```http
DELETE /api/courses/:id
```

### Registrar usuario

```http
POST /api/users/register
Content-Type: application/json
```

Body:

```json
{
  "name": "Ana Perez",
  "email": "ana@example.com",
  "password": "123456"
}
```

### Iniciar sesion

```http
POST /api/users/login
Content-Type: application/json
```

Body:

```json
{
  "email": "ana@example.com",
  "password": "123456"
}
```

### Acceso administrador

La clave por defecto para desarrollo esta en `.env.example`:

```text
ADMIN_KEY=admin123
```

Endpoints:

```http
POST /api/admin/login
GET /api/admin/database
PUT /api/admin/courses/:id
DELETE /api/admin/courses/:id
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
GET /api/python/lessons
POST /api/admin/python-lessons
PUT /api/admin/python-lessons/:lessonId
DELETE /api/admin/python-lessons/:lessonId
POST /api/admin/python-lessons/:lessonId/levels
PUT /api/admin/python-lessons/:lessonId/levels/:levelId
DELETE /api/admin/python-lessons/:lessonId/levels/:levelId
```

Las rutas protegidas usan el header:

```text
x-admin-key: admin123
```

## Middlewares

- `cors`: permite consumir la API desde el frontend.
- `express.json`: procesa cuerpos JSON.
- `morgan`: registra peticiones HTTP.
- `validateCourse`: valida datos para `POST`.
- `validatePartialCourse`: valida datos para `PUT`.
- `validateRegister`: valida datos de nuevo usuario.
- `validateLogin`: valida credenciales.
- `notFound`: responde rutas inexistentes.
- `errorHandler`: centraliza errores de validacion, rutas y servidor.

## Pruebas con Postman

Importa la coleccion:

```text
server/docs/codexling-api.postman_collection.json
```

Tambien puedes probar con curl:

```bash
curl http://localhost:3001/api/courses
```

```bash
curl -X POST http://localhost:3001/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"JAVASCRIPT\",\"icon\":\"fab fa-js\",\"description\":\"Frontend, backend y logica web\",\"page\":\"javascript\",\"type\":\"javascript\"}"
```

## GitHub

Si la carpeta aun no tiene repositorio Git:

```bash
git init
git add .
git commit -m "Implement backend REST API"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```
