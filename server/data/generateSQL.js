import { readDatabase } from "../config/database.js";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSQL() {
  const db = await readDatabase();

  let sql = `-- CodexLing Database Export
-- Generated on ${new Date().toISOString()}
-- Database for CodexLing Learning Platform

-- Create tables
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    experiencia INT DEFAULT 0,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nivel_usuario (
    id_nivel INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    xp_minimo INT DEFAULT 0,
    badge VARCHAR(50),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS curso (
    id_curso INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    icono VARCHAR(100),
    tipo VARCHAR(50),
    pagina VARCHAR(50),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leccion (
    id_leccion INT PRIMARY KEY AUTO_INCREMENT,
    id_curso INT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    orden INT,
    xp_recompensa INT DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nivel_leccion (
    id_nivel_leccion INT PRIMARY KEY AUTO_INCREMENT,
    id_leccion INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    contenido LONGTEXT,
    orden INT,
    xp_recompensa INT DEFAULT 0,
    requiere_validacion BOOLEAN DEFAULT FALSE,
    salida_esperada VARCHAR(255),
    id_lenguaje INT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_leccion) REFERENCES leccion(id_leccion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progreso_usuario (
    id_progreso INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_leccion INT NOT NULL,
    id_nivel_leccion INT,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado DATETIME,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_leccion) REFERENCES leccion(id_leccion) ON DELETE CASCADE,
    FOREIGN KEY (id_nivel_leccion) REFERENCES nivel_leccion(id_nivel_leccion) ON DELETE SET NULL
);

-- Insert data
`;

  // Insert usuarios
  if (db.users && db.users.length > 0) {
    sql += "\n-- Insertar usuarios\n";
    db.users.forEach((user) => {
      const nombre = user.name ? user.name.replace(/'/g, "''") : "Usuario";
      const correo = user.email ? user.email.replace(/'/g, "''") : "";
      const contraseña = user.password ? user.password.replace(/'/g, "''") : "";
      sql += `INSERT INTO usuario (nombre, correo, contraseña, experiencia) VALUES ('${nombre}', '${correo}', '${contraseña}', ${user.experience || 0});\n`;
    });
  }

  // Insert niveles de usuario
  if (db.userLevels && db.userLevels.length > 0) {
    sql += "\n-- Insertar niveles de usuario\n";
    db.userLevels.forEach((level) => {
      const titulo = level.title ? level.title.replace(/'/g, "''") : "";
      const descripcion = level.description ? level.description.replace(/'/g, "''") : "";
      const badge = level.badge ? level.badge.replace(/'/g, "''") : "";
      sql += `INSERT INTO nivel_usuario (titulo, descripcion, xp_minimo, badge) VALUES ('${titulo}', '${descripcion}', ${level.minXp || 0}, '${badge}');\n`;
    });
  }

  // Insert cursos
  if (db.courses && db.courses.length > 0) {
    sql += "\n-- Insertar cursos\n";
    db.courses.forEach((course) => {
      const titulo = course.title ? course.title.replace(/'/g, "''") : "";
      const descripcion = course.description ? course.description.replace(/'/g, "''") : "";
      const icono = course.icon ? course.icon.replace(/'/g, "''") : "";
      const tipo = course.type ? course.type.replace(/'/g, "''") : "";
      const pagina = course.page ? course.page.replace(/'/g, "''") : "";
      sql += `INSERT INTO curso (titulo, descripcion, icono, tipo, pagina) VALUES ('${titulo}', '${descripcion}', '${icono}', '${tipo}', '${pagina}');\n`;
    });
  }

  // Insert lecciones (combines pythonLessons and courseLessons)
  let leccionId = 1;
  const lessonMap = {};

  sql += "\n-- Insertar lecciones\n";

  // Python lessons
  if (db.pythonLessons && db.pythonLessons.length > 0) {
    db.pythonLessons.forEach((lesson) => {
      const titulo = lesson.title ? lesson.title.replace(/'/g, "''") : "";
      const descripcion = lesson.description ? lesson.description.replace(/'/g, "''") : "";
      const orden = lesson.order || 1;
      const xpRecompensa = lesson.xpReward || 0;
      sql += `INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('${titulo}', '${descripcion}', ${orden}, ${xpRecompensa});\n`;
      lessonMap[`python_${lesson.id}`] = leccionId;
      leccionId++;
    });
  }

  // Course lessons
  if (db.courseLessons) {
    Object.entries(db.courseLessons).forEach(([courseType, lessons]) => {
      if (Array.isArray(lessons)) {
        lessons.forEach((lesson) => {
          const titulo = lesson.title ? lesson.title.replace(/'/g, "''") : "";
          const descripcion = lesson.description ? lesson.description.replace(/'/g, "''") : "";
          const orden = lesson.order || 1;
          const xpRecompensa = lesson.xpReward || 0;
          sql += `INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('${titulo}', '${descripcion}', ${orden}, ${xpRecompensa});\n`;
          lessonMap[`${courseType}_${lesson.id}`] = leccionId;
          leccionId++;
        });
      }
    });
  }

  // Insert niveles de lecciones
  sql += "\n-- Insertar niveles de lecciones\n";

  if (db.pythonLessons && db.pythonLessons.length > 0) {
    db.pythonLessons.forEach((lesson) => {
      const leccionId = lessonMap[`python_${lesson.id}`];
      if (lesson.levels && Array.isArray(lesson.levels)) {
        lesson.levels.forEach((level) => {
          const titulo = level.title ? level.title.replace(/'/g, "''") : "";
          const descripcion = level.description ? level.description.replace(/'/g, "''") : "";
          const contenido = level.content ? level.content.replace(/'/g, "''") : "";
          const orden = level.order || 1;
          const xpRecompensa = level.xpReward || 0;
          const requiereValidacion = level.requiresValidation ? 1 : 0;
          const salidaEsperada = level.expectedOutput ? level.expectedOutput.replace(/'/g, "''") : "";
          const idLenguaje = level.languageId || 71;
          sql += `INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (${leccionId}, '${titulo}', '${descripcion}', '${contenido}', ${orden}, ${xpRecompensa}, ${requiereValidacion}, '${salidaEsperada}', ${idLenguaje});\n`;
        });
      }
    });
  }

  if (db.courseLessons) {
    Object.entries(db.courseLessons).forEach(([courseType, lessons]) => {
      if (Array.isArray(lessons)) {
        lessons.forEach((lesson) => {
          const leccionId = lessonMap[`${courseType}_${lesson.id}`];
          if (lesson.levels && Array.isArray(lesson.levels)) {
            lesson.levels.forEach((level) => {
              const titulo = level.title ? level.title.replace(/'/g, "''") : "";
              const descripcion = level.description ? level.description.replace(/'/g, "''") : "";
              const contenido = level.content ? level.content.replace(/'/g, "''") : "";
              const orden = level.order || 1;
              const xpRecompensa = level.xpReward || 0;
              const requiereValidacion = level.requiresValidation ? 1 : 0;
              const salidaEsperada = level.expectedOutput ? level.expectedOutput.replace(/'/g, "''") : "";
              const idLenguaje = level.languageId || 71;
              sql += `INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (${leccionId}, '${titulo}', '${descripcion}', '${contenido}', ${orden}, ${xpRecompensa}, ${requiereValidacion}, '${salidaEsperada}', ${idLenguaje});\n`;
            });
          }
        });
      }
    });
  }

  sql += "\n-- End of export\n";

  const outputPath = path.resolve(__dirname, "CodexLing_Export.sql");
  await writeFile(outputPath, sql, "utf8");
  console.log(`✅ Archivo SQL generado en: ${outputPath}`);
  console.log(`📊 Total de registros: ${db.users?.length || 0} usuarios, ${db.courses?.length || 0} cursos, ${leccionId - 1} lecciones`);
}

generateSQL().catch(console.error);
