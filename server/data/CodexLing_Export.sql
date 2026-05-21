-- CodexLing Database Export
-- Generated on 2026-05-19T18:42:55.083Z
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

-- Insertar niveles de usuario
INSERT INTO nivel_usuario (titulo, descripcion, xp_minimo, badge) VALUES ('Aprendiz', 'Primeros pasos dentro de CodexLing.', 0, 'LVL 1');
INSERT INTO nivel_usuario (titulo, descripcion, xp_minimo, badge) VALUES ('Explorador', 'Ya domina las bases y avanza con constancia.', 100, 'LVL 2');
INSERT INTO nivel_usuario (titulo, descripcion, xp_minimo, badge) VALUES ('Coder', 'Completa retos y desbloquea contenido avanzado.', 250, 'LVL 3');

-- Insertar cursos
INSERT INTO curso (titulo, descripcion, icono, tipo, pagina) VALUES ('HTML', 'Programacion enfocada en hipertexto', 'fab fa-html5', 'html', 'html');
INSERT INTO curso (titulo, descripcion, icono, tipo, pagina) VALUES ('PYTHON', 'IA y analisis de datos', 'fab fa-python', 'python', 'python');
INSERT INTO curso (titulo, descripcion, icono, tipo, pagina) VALUES ('JAVA', 'Aplicaciones empresariales', 'fab fa-java', 'java', 'java');
INSERT INTO curso (titulo, descripcion, icono, tipo, pagina) VALUES ('PHP', 'Backend y bases de datos', 'fab fa-php', 'php', 'php');

-- Insertar lecciones
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('El Despertar del Programador', 'Entra en el santuario de inicio para forjar tus primeras herramientas y entender las reglas de este nuevo mundo.', 1, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('La Encrucijada Lógica', 'Aprende a manipular la realidad con cálculos precisos y a dictar el camino que seguirá tu código.', 2, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('El Valle de la Automatización', 'Domina el control de multitudes y el procesamiento en masa para que el sistema trabaje mientras tú descansas.', 3, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('La Bóveda de Información', 'Adéntrate en estructuras complejas donde el orden y la eficiencia son la clave para gestionar grandes tesoros de datos.', 4, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('El Laboratorio de Alquimia', 'Aprende a encapsular magia pura en frascos reutilizables que podrás lanzar en cualquier momento de la batalla.', 5, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('El Despertar del Programador', 'Entra en el santuario de inicio para forjar tus primeras herramientas y entender las reglas de este nuevo mundo.', 1, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('La Encrucijada Lógica', 'Aprende a manipular la realidad con cálculos precisos y a dictar el camino que seguirá tu código.', 2, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('El Valle de la Automatización', 'Domina el control de multitudes y el procesamiento en masa para que el sistema trabaje mientras tú descansas.', 3, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('La Bóveda de Información', 'Adéntrate en estructuras complejas donde el orden y la eficiencia son la clave para gestionar grandes tesoros de datos.', 4, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('El Laboratorio de Alquimia', 'Aprende a encapsular magia pura en frascos reutilizables que podrás lanzar en cualquier momento de la batalla.', 5, 0);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('Fundamentos de la Web', 'Aprende como se estructura una pagina y que papel cumple HTML dentro del navegador.', 1, 10);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('Primer Programa en Java', 'Conoce la estructura de una clase, el metodo main y la salida por consola.', 1, 10);
INSERT INTO leccion (titulo, descripcion, orden, xp_recompensa) VALUES ('PHP del Lado del Servidor', 'Empieza a escribir scripts PHP y entiende como generan contenido dinamico.', 1, 10);

-- Insertar niveles de lecciones
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (6, 'Que es Python y porque es genial?', 'Elige tu clase inicial y descubre por qué este lenguaje es el arma más versátil del reino.', 'Plan inicial para aprender la sintaxis basica de Python.', 1, 20, 1, 'hola mundo', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (6, 'El Inventario del Héroe', 'Desbloquea tus primeros cofres de inventario para almacenar energía y datos vitales.', 'Plan para practicar estructuras de control y funciones.', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (6, 'Identificación de Botín', 'Identifica la rareza de los objetos que guardas: ¿son números mágicos o pergaminos de texto?', 'Plan para aprender sobre ciclos y listas', 3, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (7, 'Potenciadores de Combate', 'Equipa multiplicadores de daño y suma puntos de experiencia con aritmética básica.', '', 1, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (7, 'El Sendero del Destino', 'Atraviesa encrucijadas críticas donde cada elección cambia el rumbo de tu script.', '', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (8, 'El Hechizo de Repetición', 'Domina los ciclos for y while para repetir acciones automáticamente y ganar experiencia sin mover un dedo.', '', 1, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (8, 'Gestión del Inventario', 'Organiza tu equipo en formaciones dinámicas para gestionar múltiples elementos a la vez.', '', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (9, 'El Bestiario Eterno', '', 'Crea una base de datos de monstruos vinculando cada nombre con sus estadísticas únicas.', 1, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (9, 'Reliquias de Piedra', 'Descubre artefactos inmutables y portales que eliminan duplicados del mapa.', '', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (10, 'Pergaminos Reutilizables', 'Forja hechizos personalizados que puedes invocar en cualquier batalla con una sola palabra.', '', 1, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (10, 'El Mensajero del Reino', 'Envía suministros a través del código y recibe botines valiosos tras completar la tarea.', '', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (6, 'Que es Python y porque es genial?', 'Elige tu clase inicial y descubre por qué este lenguaje es el arma más versátil del reino.', 'Plan inicial para aprender la sintaxis basica de Python.', 1, 20, 1, 'hola mundo', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (6, 'El Inventario del Héroe', 'Desbloquea tus primeros cofres de inventario para almacenar energía y datos vitales.', 'Plan para practicar estructuras de control y funciones.', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (6, 'Identificación de Botín', 'Identifica la rareza de los objetos que guardas: ¿son números mágicos o pergaminos de texto?', 'Plan para aprender sobre ciclos y listas', 3, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (7, 'Potenciadores de Combate', 'Equipa multiplicadores de daño y suma puntos de experiencia con aritmética básica.', '', 1, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (7, 'El Sendero del Destino', 'Atraviesa encrucijadas críticas donde cada elección cambia el rumbo de tu script.', '', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (8, 'El Hechizo de Repetición', 'Domina los ciclos for y while para repetir acciones automáticamente y ganar experiencia sin mover un dedo.', '', 1, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (8, 'Gestión del Inventario', 'Organiza tu equipo en formaciones dinámicas para gestionar múltiples elementos a la vez.', '', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (9, 'El Bestiario Eterno', '', 'Crea una base de datos de monstruos vinculando cada nombre con sus estadísticas únicas.', 1, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (9, 'Reliquias de Piedra', 'Descubre artefactos inmutables y portales que eliminan duplicados del mapa.', '', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (10, 'Pergaminos Reutilizables', 'Forja hechizos personalizados que puedes invocar en cualquier batalla con una sola palabra.', '', 1, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (10, 'El Mensajero del Reino', 'Envía suministros a través del código y recibe botines valiosos tras completar la tarea.', '', 2, 0, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (11, 'Estructura basica', 'Reconoce las etiquetas esenciales de un documento HTML.', 'Crea una pagina con html, head, body, un titulo y un parrafo principal.', 1, 10, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (11, 'Contenido semantico', 'Organiza informacion con encabezados, secciones, listas y enlaces.', 'Construye una seccion de perfil usando h1, section, ul, li y a.', 2, 15, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (12, 'Clase principal', 'Identifica la clase publica y el punto de entrada del programa.', 'Crea una clase Main con public static void main y muestra un mensaje en consola.', 1, 10, 1, 'hola mundo', 62);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (12, 'Variables y tipos', 'Declara datos simples para guardar numeros, texto y valores logicos.', 'Practica con int, double, String y boolean dentro del metodo main.', 2, 15, 0, '', 71);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (13, 'Sintaxis inicial', 'Usa etiquetas PHP, variables y echo para imprimir contenido.', 'Crea un script con una variable de nombre y muestra un saludo usando echo.', 1, 10, 1, 'hola mundo', 68);
INSERT INTO nivel_leccion (id_leccion, titulo, descripcion, contenido, orden, xp_recompensa, requiere_validacion, salida_esperada, id_lenguaje) VALUES (13, 'Datos dinamicos', 'Combina texto, variables y condiciones para responder a diferentes casos.', 'Construye un mensaje que cambie segun una variable de rol o estado.', 2, 15, 0, '', 71);

-- End of export
