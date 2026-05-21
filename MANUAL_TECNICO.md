# Manual técnico - CodexLing React + API REST

## 1. Descripción general

CodexLing es una aplicación híbrida con frontend en React y backend en Node.js/Express. Está diseñada para enseñar cursos de programación, gestionar lecciones y niveles, permitir publicación de foros y administrar contenido desde un panel de administración.

La arquitectura actual está dividida en dos capas:
- `src/`: frontend React con Vite y UI para navegación de cursos, contenido y administración.
- `server/`: backend Express que expone una API REST para cursos, usuarios, lecciones, validación de código y administración.

## 2. Requisitos

### Requisitos de software

- Node.js 20 o superior.
- npm, incluido normalmente con Node.js.
- SQL Server accesible desde la máquina donde se ejecuta el backend.
- Navegador web moderno para usar el frontend: Google Chrome, Microsoft Edge, Mozilla Firefox o Safari en versiones recientes.

### Requisitos del equipo donde se ejecuta el sistema

Estos requisitos aplican al computador o servidor donde se instalan y ejecutan el frontend, el backend y la conexión a SQL Server.

| Recurso | Mínimo | Recomendado |
| --- | --- | --- |
| Procesador | 2 núcleos, 1.8 GHz | 4 núcleos o más, 2.4 GHz o superior |
| Memoria RAM | 4 GB | 8 GB o más |
| Espacio libre en disco | 2 GB para proyecto, dependencias y datos iniciales | 5 GB o más para logs, crecimiento de datos y copias de respaldo |
| Sistema operativo | Windows 10, Windows 11, Linux Ubuntu 20.04+ o macOS 12+ | Windows 11, Ubuntu 22.04+ o macOS 13+ |
| Red | Acceso local a los puertos `5173` y `3001` | Red estable; acceso LAN o servidor publicado si otros usuarios se conectan |
| Base de datos | SQL Server Express o instancia SQL Server existente | SQL Server 2019/2022 Express, Developer o Standard |

### Requisitos del dispositivo cliente

Si el usuario solo accede a la aplicación desde el navegador y no ejecuta el servidor en su equipo, los requisitos son menores:

| Recurso | Mínimo | Recomendado |
| --- | --- | --- |
| Memoria RAM | 2 GB | 4 GB o más |
| Espacio libre en disco | 200 MB para caché del navegador | 1 GB o más |
| Sistema operativo | Windows 10, Android 10, iOS 14, macOS 12 o Linux moderno | Versiones recientes y con actualizaciones de seguridad |
| Navegador | Chrome, Edge, Firefox o Safari actualizado | Última versión estable del navegador |
| Conexión | Acceso a la URL del frontend y a la API | Conexión estable de banda ancha o red local |

### Consideraciones adicionales

- Para desarrollo local se recomienda ejecutar en terminales separadas `npm run dev` y `npm run dev:server`.
- Si SQL Server se ejecuta en la misma máquina, se recomienda usar al menos 8 GB de RAM.
- Si la validación de código con Judge0 depende de un servicio externo, el backend necesita acceso a internet o a la instancia configurada de Judge0.
- En producción se recomienda configurar variables de entorno seguras, especialmente `ADMIN_KEY`, `SQL_USER` y `SQL_PASSWORD`.

## 3. Instalación

1. Clonar o descargar el proyecto.
2. Abrir la carpeta raíz del proyecto.
3. Ejecutar:

```bash
npm install
```

4. Crear un archivo `.env` en la raíz si se quiere personalizar puertos, CORS, admin y base de datos.

## 4. Configuración del entorno

### Variables de entorno disponibles

La aplicación carga las variables definidas en `.env` mediante `server/config/env.js`.

- `PORT`: puerto del backend. Default: `3001`.
- `NODE_ENV`: entorno (`development` / `production`). Default: `development`.
- `CORS_ORIGIN`: orígenes permitidos para CORS. Default: `http://localhost:5173,http://localhost:5174,http://localhost:5175`.
- `ADMIN_KEY`: clave para habilitar rutas de administración. Default: `admin123`.
- `SQL_SERVER`: nombre o IP del servidor SQL Server. Default: `localhost`.
- `SQL_USER`: usuario de SQL Server. Default: `sa`.
- `SQL_PASSWORD`: contraseña del usuario SQL Server. Default: ``.
- `SQL_DATABASE`: nombre de la base de datos. Default: `CodexLing`.

### Comportamiento de CORS

`server/app.js` permite solo los orígenes listados en `CORS_ORIGIN`. También acepta solicitudes sin origen para herramientas como Postman.

### Administración

Las rutas de administración (`/api/admin/...`) exigen la cabecera HTTP:

- `x-admin-key: <ADMIN_KEY>`

Si la cabecera falta o es incorrecta, la API devuelve `401 Clave de administrador invalida.`.

## 5. Estructura de carpetas

### Frontend

- `src/` - código fuente React.
- `src/main.jsx` - punto de entrada de Vite.
- `src/App.jsx` - componente raíz que define la navegación y rutas internas.
- `src/assets/pages/` - páginas principales: `Home.jsx`, `Admin.jsx`, `Forum.jsx`, `Html.jsx`, `Java.jsx`, `Php.jsx`, `Python.jsx`, `PythonCourse.jsx`.
- `src/assets/components/` - componentes reutilizables: `Header.jsx`, `CourseCard.jsx`, `Courses.jsx`, `Marquee.jsx`, `MobileMenu.jsx`.
- `src/styles/Global.css` - estilos globales.
- `src/api/realtime.js` - cliente del evento en tiempo real.

### Backend

- `server/index.js` - arranque del servidor y verificación/creación de base de datos.
- `server/app.js` - configuración de Express, CORS, middlewares, rutas y logging.
- `server/config/env.js` - define las variables de entorno y configuración de SQL Server.
- `server/config/sqlserver.js` - conexión SQL Server, creación de base de datos, tabla y persistencia JSON.
- `server/controllers/` - lógica de negocio por recurso.
- `server/routes/` - definición de rutas del API.
- `server/models/` - lectura y escritura de datos.
- `server/middlewares/` - validación de datos y manejo de errores.
- `server/data/` - contenidos iniciales en `database.json` y script de generación de SQL.
- `server/utils/` - utilidades de eventos en tiempo real, errores personalizados y validación con Judge0.

## 6. Ejecución del sistema

### Frontend

```bash
npm run dev
```

Abre la UI en `http://localhost:5173`.

### Backend en desarrollo

```bash
npm run dev:server
```

Inicia `server/index.js` con `node --watch` y recarga automática en cambios.

### Backend producción / sin watch

```bash
npm run server
```

También disponible:

- `npm run start` → igual que `npm run server`
- `npm run build` → compila el frontend Vite
- `npm run preview` → vista previa de la build Vite
- `npm run lint` → ejecuta ESLint
- `npm run test:api` → corre el script `server/scripts/testEndpoints.js`

## 7. Persistencia y base de datos

### SQL Server con JSON en `app_state`

El backend usa `mssql` para conectarse a SQL Server. Al iniciar:

1. `server/config/sqlserver.js` verifica si la base de datos `CodexLing` existe y la crea si no.
2. Verifica la tabla `app_state`.
3. Si no hay fila con `id = 1`, carga datos iniciales desde `server/data/database.json` o desde `initialDatabase` embebido.
4. El contenido completo se guarda como JSON en `app_state.content`.

Esto significa que la persistencia es híbrida: la base de datos es SQL Server, pero el modelo de datos se almacena internamente como JSON.

### Datos iniciales cargados

El JSON inicial incluye:
- `users`
- `userLevels`
- `pythonLessons`
- `courseLessons` por tipo de curso (`html`, `java`, `php`)
- `forumTopics`
- `courses`

## 8. API REST detallada

Todas las rutas comienzan en `/api`.

### Salud y eventos en tiempo real

- `GET /api/health`
  - Retorna status del servicio y la base de datos.
- `GET /api/events`
  - Streaming SSE para eventos en tiempo real.
  - El servidor envía mensajes cuando se crean/actualizan/eliminan lecciones o niveles.

### Cursos

- `GET /api/courses`
  - Devuelve lista de cursos.
- `GET /api/courses/:id`
  - Devuelve un curso específico.
- `POST /api/courses`
  - Crea un curso.
- `PUT /api/courses/:id`
  - Actualiza un curso.
- `DELETE /api/courses/:id`
  - Elimina un curso.

### Lecciones y niveles de cursos

- `GET /api/courses/:courseType/lessons`
  - Lista lecciones para el tipo de curso (`html`, `java`, `php`).
- `POST /api/courses/:courseType/lessons`
  - Crea una lección.
- `PUT /api/courses/:courseType/lessons/:lessonId`
  - Actualiza una lección.
- `DELETE /api/courses/:courseType/lessons/:lessonId`
  - Elimina una lección.
- `POST /api/courses/:courseType/lessons/:lessonId/levels`
  - Crea un nuevo nivel dentro de la lección.
- `PUT /api/courses/:courseType/lessons/:lessonId/levels/:levelId`
  - Actualiza un nivel.
- `DELETE /api/courses/:courseType/lessons/:lessonId/levels/:levelId`
  - Elimina un nivel.
- `POST /api/courses/:courseType/lessons/:lessonId/levels/:levelId/validate`
  - Valida código de nivel de curso con Judge0.

### Lecciones y niveles de Python

- `GET /api/python/lessons`
  - Lista lecciones de Python.
- `POST /api/python/lessons`
  - Crea una lección de Python.
- `PUT /api/python/lessons/:id`
  - Actualiza una lección de Python.
- `DELETE /api/python/lessons/:id`
  - Elimina una lección de Python.
- `POST /api/python/lessons/:lessonId/levels`
  - Agrega un nivel a una lección de Python.
- `PUT /api/python/lessons/:lessonId/levels/:levelId`
  - Actualiza un nivel de Python.
- `DELETE /api/python/lessons/:lessonId/levels/:levelId`
  - Elimina un nivel de Python.
- `POST /api/python/lessons/:lessonId/levels/:levelId/validate`
  - Valida código Python según `source_code`, `languageId` y `expectedOutput`.

### Usuarios y progreso

- `POST /api/users/register`
  - Registra un usuario.
  - Cuerpo esperado: datos de usuario.
- `POST /api/users/login`
  - Inicia sesión y retorna datos del usuario.
  - Cuerpo esperado: email y contraseña.
- `POST /api/users/:id/progress/courses/:courseType/levels`
  - Marca un nivel de curso como completado.
  - Cuerpo esperado:
    ```json
    {
      "lessonId": 1,
      "levelId": 2
    }
    ```
- `POST /api/users/:id/progress/python-levels`
  - Marca un nivel de Python como completado.
  - Cuerpo esperado:
    ```json
    {
      "lessonId": 1,
      "levelId": 2
    }
    ```

### Foro

- `GET /api/forum/topics`
  - Obtiene lista de temas.
- `GET /api/forum/topics/:topicId`
  - Obtiene un tema con comentarios.
- `POST /api/forum/topics`
  - Crea un tema de foro.
- `POST /api/forum/topics/:topicId/comments`
  - Publica un comentario en un tema.

### Administración

Todas estas rutas requieren la cabecera `x-admin-key`.

- `POST /api/admin/login`
  - Login de administrador.
- `GET /api/admin/database`
  - Obtiene el contenido almacenado en la base de datos JSON.
- `PUT /api/admin/courses/:id`
  - Actualiza un curso.
- `DELETE /api/admin/courses/:id`
  - Elimina un curso.
- `PUT /api/admin/users/:id`
  - Actualiza un usuario.
- `DELETE /api/admin/users/:id`
  - Elimina un usuario.
- `POST /api/admin/user-levels`
  - Crea un nivel de usuario.
- `PUT /api/admin/user-levels/:levelId`
  - Actualiza un nivel de usuario.
- `DELETE /api/admin/user-levels/:levelId`
  - Elimina un nivel de usuario.
- `POST /api/admin/courses/:courseType/lessons`
  - Crea una lección de curso.
- `PUT /api/admin/courses/:courseType/lessons/:lessonId`
  - Actualiza una lección de curso.
- `DELETE /api/admin/courses/:courseType/lessons/:lessonId`
  - Elimina una lección de curso.
- `POST /api/admin/courses/:courseType/lessons/:lessonId/levels`
  - Crea un nivel de curso.
- `PUT /api/admin/courses/:courseType/lessons/:lessonId/levels/:levelId`
  - Actualiza un nivel de curso.
- `DELETE /api/admin/courses/:courseType/lessons/:lessonId/levels/:levelId`
  - Elimina un nivel de curso.
- `POST /api/admin/python-lessons`
  - Crea una lección de Python.
- `PUT /api/admin/python-lessons/:lessonId`
  - Actualiza una lección de Python.
- `DELETE /api/admin/python-lessons/:lessonId`
  - Elimina una lección de Python.
- `POST /api/admin/python-lessons/:lessonId/levels`
  - Crea un nivel de Python.
- `PUT /api/admin/python-lessons/:lessonId/levels/:levelId`
  - Actualiza un nivel de Python.
- `DELETE /api/admin/python-lessons/:lessonId/levels/:levelId`
  - Elimina un nivel de Python.
- `PUT /api/admin/forum/topics/:topicId`
  - Actualiza un tema de foro.
- `DELETE /api/admin/forum/topics/:topicId`
  - Elimina un tema de foro.
- `DELETE /api/admin/forum/topics/:topicId/comments/:commentId`
  - Elimina un comentario de foro.

## 9. Modelo de datos principal

### Cursos

Cada curso contiene:
- `id`
- `title`
- `icon`
- `description`
- `page`
- `type`
- `createdAt`, `updatedAt`

### Lecciones

Cada lección contiene:
- `id`
- `title`
- `description`
- `content`
- `order`
- `xpReward`
- `levels`

### Niveles

Cada nivel contiene:
- `id`
- `title`
- `description`
- `content`
- `order`
- `xpReward`
- `requiresValidation` (opcional)
- `expectedOutput` (opcional)
- `languageId` (opcional)

### Usuario

El usuario puede almacenar progreso y niveles, además de datos de registro y su nivel actual.

## 10. Componentes frontend y experiencia de usuario

- `Header.jsx`: barra de navegación principal.
- `CourseCard.jsx`: tarjeta de curso con icono y descripción.
- `Courses.jsx`: listado de cursos disponibles.
- `Marquee.jsx`: componente de texto animado.
- `MobileMenu.jsx`: menú responsive para móviles.
- `Home.jsx`: página inicial de presentación y selección de cursos.
- `Forum.jsx`: interfaz de foro para crear temas y comentar.
- `PythonCourse.jsx`: vista específica del curso de Python.
- `Admin.jsx`: panel administrativo que permite crear, editar y eliminar lecciones y niveles.

## 11. Seguridad y validación

- No hay JWT implementado en el backend. El login devuelve datos del usuario sin token.
- Las rutas de administración se protegen con `x-admin-key`.
- Los middlewares de validación revisan formatos y campos requeridos:
  - `server/middlewares/validateCourse.js`
  - `server/middlewares/validatePythonLesson.js`
  - `server/middlewares/validateUser.js`
  - `server/middlewares/validateUserLevel.js`
- `server/middlewares/errorHandler.js` centraliza el manejo de errores.
- `server/middlewares/notFound.js` gestiona rutas no definidas.

## 12. Observaciones de implementación

- `server/app.js` registra todas las solicitudes a `/api` para depuración.
- `server/utils/realtime.js` implementa Server-Sent Events con `GET /api/events`.
- `server/utils/judge0Validator.js` es responsable de enviar código a Judge0 y obtener el resultado.
- La base de datos se serializa/deserializa como JSON completo en una sola fila.

## 13. Recomendaciones de evolución

- Implementar JWT o sesión basada en tokens para el login.
- Separar frontend y backend en repositorios/módulos independientes para despliegue por separado.
- Añadir pruebas unitarias y de integración para backend y frontend.
- Migrar la persistencia a un modelo relacional o documental real en lugar de guardar JSON en una sola tabla.
- Agregar control de versiones y migraciones de esquema para la base de datos.
- Usar `Zod` o `Joi` para validaciones de esquema más robustas.

## 14. Archivos clave

- `package.json` - scripts y dependencias.
- `vite.config.js` - configuración del bundler.
- `server/index.js` - arranque y aseguramiento de base de datos.
- `server/app.js` - configuración de Express y rutas.
- `server/config/env.js` - variables de entorno.
- `server/config/sqlserver.js` - persistencia en SQL Server.
- `server/routes/` - definición de rutas del API.
- `server/controllers/` - lógica de negocio.
- `server/middlewares/` - validaciones y manejo de errores.
- `src/App.jsx` - lógica de routing principal del frontend.
- `src/assets/pages/` - vistas de la aplicación.
- `src/assets/components/` - componentes reutilizables.

## 15. Cómo ampliar el sistema

- Para nuevos cursos: añadir objetos en `server/data/database.json` o usar los endpoints de cursos.
- Para nuevos contenidos: crear nuevas páginas en `src/assets/pages/` y enlazarlas en `App.jsx`.
- Para nuevas API: agregar rutas en `server/routes/` y controladores en `server/controllers/`.
- Para más permisos: crear nuevos middlewares de autorización.

---

Este manual técnico describe la arquitectura actual, la instalación, la ejecución, la API y las áreas clave para mantenimiento y expansión.
