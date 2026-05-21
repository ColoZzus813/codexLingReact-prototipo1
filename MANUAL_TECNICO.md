# Manual técnico - CodexLing React + API REST

## 1. Descripción general

CodexLing es una aplicación web con frontend en React y backend API REST en Node.js + Express. Permite mostrar cursos de programación, navegar entre temas, gestionar usuarios y administrar contenido desde una API.

El sistema está dividido en dos partes:
- `src/`: interfaz de usuario construida con React y Vite.
- `server/`: servidor REST que expone endpoints para cursos, usuarios, lecciones de Python y administración.


## 2. Requisitos

- Node.js 20 o superior
- npm


## 3. Instalación

1. Clonar o descargar el proyecto.
2. Abrir la carpeta raíz del proyecto.
3. Ejecutar:

```bash
npm install
```

4. Crear un archivo `.env` si se desea configurar el puerto o el origen de CORS.


## 4. Configuración del entorno

El servidor usa el archivo `.env` para configurar:

- `PORT`: puerto de ejecución del backend (por defecto `3001`).
- `NODE_ENV`: entorno de ejecución (`development` / `production`).
- `CORS_ORIGIN`: origen permitido por CORS (por defecto `http://localhost:5173`).
- `ADMIN_KEY`: clave de administrador (por defecto `admin123`).

Si no se crea `.env`, se usan los valores por defecto definidos en `server/config/env.js`.

### Base de datos SQL Server

- `server/config/database.js` crea/verifica la conexión a SQL Server al arrancar.
- Las credenciales se configuran en `.env` con `SQL_SERVER`, `SQL_USER`, `SQL_PASSWORD` y `SQL_DATABASE`.
- Si existe `server/data/database.json`, el servidor importa su contenido en SQL Server la primera vez que arranca.
- No se utiliza SQLite en el proyecto.

## 5. Estructura del proyecto

### Frontend

- `src/App.jsx`: componente principal de la aplicación.
- `src/assets/pages/`: páginas y vistas de contenido.
- `src/assets/components/`: componentes reutilizables como `Header`, `CourseCard`, `Marquee` y `MobileMenu`.
- `src/styles/Global.css`: estilos principales de la interfaz.

### Backend

- `server/app.js`: configuración de Express, middlewares y rutas.
- `server/index.js`: arranque del servidor y verificación de la base de datos.
- `server/config/env.js`: variables de entorno y configuración.
- `server/config/database.js`: gestiona la conexión a SQL Server y la lectura/escritura de datos.
- `server/controllers/`: controladores que ejecutan la lógica de negocio.
- `server/routes/`: definición de rutas y endpoints.
- `server/models/`: acceso y gestión de datos persistentes.
- `server/data/database.json`: archivo de datos iniciales opcional para importar en SQL Server.


## 6. Cómo ejecutar el sistema

### Arrancar el frontend

```bash
npm run dev
```

Esto inicia Vite y sirve la interfaz en `http://localhost:5173`.

### Arrancar el backend

```bash
npm run dev:server
```

Inicia el servidor Node.js con `--watch` para recargar automáticamente.

También se puede ejecutar sin watch:

```bash
npm run server
```


## 7. API REST disponible

La API se expone bajo `/api`.

### Salud del sistema

- `GET /api/health`

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "codexling-api",
  "database": "connected"
}
```

### Cursos

- `GET /api/courses` - Lista todos los cursos.
- `GET /api/courses/:id` - Obtiene un curso por su ID.
- `POST /api/courses` - Crea un curso nuevo.
- `PUT /api/courses/:id` - Actualiza un curso existente.
- `DELETE /api/courses/:id` - Elimina un curso.

### Usuarios

- `POST /api/users/register` - Registra un usuario nuevo.
- `POST /api/users/login` - Inicia sesión de usuario.

### Lecciones de Python

- `GET /api/python/lessons` - Lista lecciones de Python.
- `POST /api/python/lessons` - Crea una lección nueva. (Probablemente restringida a admin.)
- `PUT /api/python/lessons/:lessonId` - Actualiza una lección.
- `DELETE /api/python/lessons/:lessonId` - Elimina una lección.
- `POST /api/admin/python-lessons/:lessonId/levels` - Añade un nivel a una lección.
- `PUT /api/admin/python-lessons/:lessonId/levels/:levelId` - Actualiza un nivel.
- `DELETE /api/admin/python-lessons/:lessonId/levels/:levelId` - Elimina un nivel.
- `POST /api/python/:lessonId/levels/:levelId/validate` - Valida código Python para un nivel específico usando Judge0.

Body para validación:

```json
{
  "source_code": "print('Hello, World!')"
}
```

Respuesta exitosa:

```json
{
  "success": true,
  "message": "Lección completada exitosamente"
}
```

Respuesta con error:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Nota**: Solo funciona si el nivel tiene `requiresValidation: true`. Los datos de `expectedOutput` y `languageId` se obtienen del nivel configurado por el administrador.

### Administración

- `POST /api/admin/login` - Inicia sesión de administrador.
- `GET /api/admin/database` - Consulta de estado de la base de datos.
- `PUT /api/admin/courses/:id` - Actualiza un curso como administrador.
- `DELETE /api/admin/courses/:id` - Elimina un curso como administrador.
- `PUT /api/admin/users/:id` - Actualiza un usuario.
- `DELETE /api/admin/users/:id` - Elimina un usuario.


## 8. Panorama funcional

### Frontend

- Pantalla principal con navegación entre cursos y temas.
- Página de administración (`Admin.jsx`) para gestionar lecciones y niveles de Python con validación de código.
- Búsqueda de contenido dentro de la página principal.
- Menú móvil desplegable para dispositivos pequeños.

### Backend

- Controladores separados para mantener la lógica de negocio.
- Rutas organizadas por recurso.
- Modelos con campos para validación de código:
  - `requiresValidation`: boolean - Indica si el nivel requiere validación con Judge0.
  - `expectedOutput`: string - La salida esperada para validar el código.
  - `languageId`: number - ID del lenguaje en Judge0 (71 para Python por defecto).
- Middlewares para:
  - manejar errores (`server/middlewares/errorHandler.js`)
  - manejar rutas no encontradas (`server/middlewares/notFound.js`)
  - validar datos y permisos.
- Base de datos local JSON para almacenamiento ligero y rápido.


## 9. Tips de uso

- Para desarrollo, mantén `npm run dev` y `npm run dev:server` en dos terminales distintos.
- Si cambias la configuración de CORS o el puerto, asegúrate de actualizar el `.env` y reiniciar el servidor.
- Para pruebas de endpoints, usa Postman o `server/scripts/testEndpoints.js`.


## 10. Mejores prácticas futuras

- Migrar `server/data/database.json` a una base de datos real como MongoDB o PostgreSQL.
- Implementar autenticación segura con tokens JWT.
- Añadir validación de esquema con `Joi` o `Zod`.
- Añadir pruebas unitarias y de integración para frontend y backend.
- Separar el frontend y backend en proyectos distintos si se desea desplegar en entornos separados.


## 11. Archivos clave

- `package.json` - dependencias y scripts.
- `vite.config.js` - configuración de Vite.
- `server/app.js` - middleware y rutas.
- `server/index.js` - arranque del backend.
- `server/config/env.js` - configuración de variables de entorno.
- `server/data/database.json` - datos de la aplicación.
- `src/App.jsx` - navegación principal y renderizado de páginas.
- `src/assets/pages/` - páginas de contenido.
- `src/assets/components/` - componentes UI reutilizables.


## 12. Cómo ampliar el sistema

- Agregar nuevos cursos en `server/data/database.json` o mediante el endpoint de creación de cursos.
- Añadir nuevas páginas al frontend creando un nuevo componente en `src/assets/pages/` y actualizando `App.jsx`.
- Crear nuevas rutas en `server/routes/` y controladores en `server/controllers/` para ampliar la API.
- Añadir autenticación o roles más complejos usando middleware adicional.


---

Este manual ofrece una visión completa del sistema actual para su uso, mantenimiento y expansión.
