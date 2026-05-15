# Manual del Sistema - CodexLing React + API REST

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

El servidor define valores por defecto para:

- `PORT` → `3001`
- `NODE_ENV` → `development`
- `CORS_ORIGIN` → `http://localhost:5173,http://localhost:5174,http://localhost:5175`
- `ADMIN_KEY` → `admin123`


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
- `server/config/database.js`: inicialización de la base de datos local.
- `server/controllers/`: controladores que ejecutan la lógica de negocio.
- `server/routes/`: definición de rutas y endpoints.
- `server/models/`: acceso y gestión de datos persistentes.
- `server/middlewares/`: middlewares de manejo de errores y rutas no encontradas.
- `server/data/database.json`: almacenamiento local de datos.


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

Para iniciar el backend de forma estándar también se puede usar:

```bash
npm start
```

### Comandos útiles adicionales

- `npm run build` - Genera el build de producción del frontend con Vite.
- `npm run preview` - Previsualiza el build de Vite localmente.
- `npm run lint` - Ejecuta ESLint sobre todo el proyecto.
- `npm run test:api` - Ejecuta pruebas de endpoints con `server/scripts/testEndpoints.js`.


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

### Eventos en tiempo real

- `GET /api/events` - Emite eventos en tiempo real hacia el frontend.

### Cursos

- `GET /api/courses` - Lista todos los cursos.
- `GET /api/courses/:id` - Obtiene un curso por su ID.
- `POST /api/courses` - Crea un curso nuevo.
- `PUT /api/courses/:id` - Actualiza un curso existente.
- `DELETE /api/courses/:id` - Elimina un curso.

### Lecciones de curso

- `GET /api/courses/:courseType/lessons` - Lista lecciones para un tipo de curso.
- `POST /api/courses/:courseType/lessons` - Crea una lección en un curso.
- `PUT /api/courses/:courseType/lessons/:lessonId` - Actualiza una lección de curso.
- `DELETE /api/courses/:courseType/lessons/:lessonId` - Elimina una lección de curso.
- `POST /api/courses/:courseType/lessons/:lessonId/levels` - Crea un nivel en una lección de curso.
- `PUT /api/courses/:courseType/lessons/:lessonId/levels/:levelId` - Actualiza un nivel de curso.
- `DELETE /api/courses/:courseType/lessons/:lessonId/levels/:levelId` - Elimina un nivel de curso.
- `POST /api/courses/:courseType/lessons/:lessonId/levels/:levelId/validate` - Valida código para un nivel de curso.

### Usuarios

- `POST /api/users/register` - Registra un usuario nuevo.
- `POST /api/users/login` - Inicia sesión de usuario.
- `POST /api/users/:id/progress/courses/:courseType/levels` - Marca un nivel de curso como completado para un usuario.
- `POST /api/users/:id/progress/python-levels` - Marca un nivel Python como completado para un usuario.

### Lecciones de Python

- `GET /api/python/lessons` - Lista lecciones de Python.
- `POST /api/python/lessons` - Crea una lección nueva.
- `PUT /api/python/lessons/:id` - Actualiza una lección.
- `DELETE /api/python/lessons/:id` - Elimina una lección.
- `POST /api/python/lessons/:lessonId/levels` - Crea un nivel en una lección de Python.
- `PUT /api/python/lessons/:lessonId/levels/:levelId` - Actualiza un nivel de Python.
- `DELETE /api/python/lessons/:lessonId/levels/:levelId` - Elimina un nivel de Python.
- `POST /api/python/lessons/:lessonId/levels/:levelId/validate` - Valida código Python para un nivel específico usando Judge0.

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

**Nota**: Solo funciona si el nivel tiene `requiresValidation: true`. Los datos de `expectedOutput` y `languageId` se obtienen del nivel configurado por la lección.

### Administración

- `POST /api/admin/login` - Inicia sesión de administrador.
- `GET /api/admin/database` - Consulta de estado de la base de datos.
- `PUT /api/admin/courses/:id` - Actualiza un curso como administrador.
- `DELETE /api/admin/courses/:id` - Elimina un curso como administrador.
- `PUT /api/admin/users/:id` - Actualiza un usuario.
- `DELETE /api/admin/users/:id` - Elimina un usuario.
- `POST /api/admin/user-levels` - Crea un nivel de usuario.
- `PUT /api/admin/user-levels/:levelId` - Actualiza un nivel de usuario.
- `DELETE /api/admin/user-levels/:levelId` - Elimina un nivel de usuario.
- `POST /api/admin/courses/:courseType/lessons` - Crea una lección de curso como admin.
- `PUT /api/admin/courses/:courseType/lessons/:lessonId` - Actualiza una lección de curso como admin.
- `DELETE /api/admin/courses/:courseType/lessons/:lessonId` - Elimina una lección de curso como admin.
- `POST /api/admin/courses/:courseType/lessons/:lessonId/levels` - Crea un nivel de curso como admin.
- `PUT /api/admin/courses/:courseType/lessons/:lessonId/levels/:levelId` - Actualiza un nivel de curso como admin.
- `DELETE /api/admin/courses/:courseType/lessons/:lessonId/levels/:levelId` - Elimina un nivel de curso como admin.
- `POST /api/admin/python-lessons` - Crea una lección de Python como admin.
- `PUT /api/admin/python-lessons/:lessonId` - Actualiza una lección de Python como admin.
- `DELETE /api/admin/python-lessons/:lessonId` - Elimina una lección de Python como admin.
- `POST /api/admin/python-lessons/:lessonId/levels` - Crea un nivel de Python como admin.
- `PUT /api/admin/python-lessons/:lessonId/levels/:levelId` - Actualiza un nivel de Python como admin.
- `DELETE /api/admin/python-lessons/:lessonId/levels/:levelId` - Elimina un nivel de Python como admin.


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
