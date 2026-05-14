import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const databasePath = path.resolve(__dirname, "../data/database.json");

const initialDatabase = {
  users: [],
  userLevels: [
    {
      id: 1,
      title: "Aprendiz",
      description: "Primeros pasos dentro de CodexLing.",
      minXp: 0,
      badge: "LVL 1",
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z"
    },
    {
      id: 2,
      title: "Explorador",
      description: "Ya domina las bases y avanza con constancia.",
      minXp: 100,
      badge: "LVL 2",
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z"
    },
    {
      id: 3,
      title: "Coder",
      description: "Completa retos y desbloquea contenido avanzado.",
      minXp: 250,
      badge: "LVL 3",
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z"
    }
  ],
  pythonLessons: [
    {
      id: 1,
      title: "Fundamentos de Python",
      description: "Primeros pasos con sintaxis, variables y tipos de datos.",
      order: 1,
      levels: [
        {
          id: 1,
          title: "Nivel basico",
          description: "Variables, print y operaciones simples.",
          content: "Plan inicial para aprender la sintaxis basica de Python.",
          xpReward: 20,
          order: 1
        },
        {
          id: 2,
          title: "Nivel intermedio",
          description: "Condicionales, ciclos y funciones.",
          content: "Plan para practicar estructuras de control y funciones.",
          xpReward: 30,
          order: 2
        }
      ],
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z"
    }
  ],
  courseLessons: {
    html: [
      {
        id: 1,
        title: "Fundamentos de la Web",
        description: "Aprende como se estructura una pagina y que papel cumple HTML dentro del navegador.",
        order: 1,
        xpReward: 10,
        levels: [
          {
            id: 1,
            title: "Estructura basica",
            description: "Reconoce las etiquetas esenciales de un documento HTML.",
            content: "Crea una pagina con html, head, body, un titulo y un parrafo principal.",
            order: 1,
            xpReward: 10
          },
          {
            id: 2,
            title: "Contenido semantico",
            description: "Organiza informacion con encabezados, secciones, listas y enlaces.",
            content: "Construye una seccion de perfil usando h1, section, ul, li y a.",
            order: 2,
            xpReward: 15
          }
        ],
        createdAt: "2026-05-14T00:00:00.000Z",
        updatedAt: "2026-05-14T00:00:00.000Z"
      }
    ],
    java: [
      {
        id: 1,
        title: "Primer Programa en Java",
        description: "Conoce la estructura de una clase, el metodo main y la salida por consola.",
        order: 1,
        xpReward: 10,
        levels: [
          {
            id: 1,
            title: "Clase principal",
            description: "Identifica la clase publica y el punto de entrada del programa.",
            content: "Crea una clase Main con public static void main y muestra un mensaje en consola.",
            order: 1,
            xpReward: 10
          },
          {
            id: 2,
            title: "Variables y tipos",
            description: "Declara datos simples para guardar numeros, texto y valores logicos.",
            content: "Practica con int, double, String y boolean dentro del metodo main.",
            order: 2,
            xpReward: 15
          }
        ],
        createdAt: "2026-05-14T00:00:00.000Z",
        updatedAt: "2026-05-14T00:00:00.000Z"
      }
    ],
    php: [
      {
        id: 1,
        title: "PHP del Lado del Servidor",
        description: "Empieza a escribir scripts PHP y entiende como generan contenido dinamico.",
        order: 1,
        xpReward: 10,
        levels: [
          {
            id: 1,
            title: "Sintaxis inicial",
            description: "Usa etiquetas PHP, variables y echo para imprimir contenido.",
            content: "Crea un script con una variable de nombre y muestra un saludo usando echo.",
            order: 1,
            xpReward: 10
          },
          {
            id: 2,
            title: "Datos dinamicos",
            description: "Combina texto, variables y condiciones para responder a diferentes casos.",
            content: "Construye un mensaje que cambie segun una variable de rol o estado.",
            order: 2,
            xpReward: 15
          }
        ],
        createdAt: "2026-05-14T00:00:00.000Z",
        updatedAt: "2026-05-14T00:00:00.000Z"
      }
    ]
  },
  courses: [
    {
      id: 1,
      title: "HTML",
      icon: "fab fa-html5",
      description: "Programacion enfocada en hipertexto",
      page: "html",
      type: "html",
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z"
    },
    {
      id: 2,
      title: "PYTHON",
      icon: "fab fa-python",
      description: "IA y analisis de datos",
      page: "python",
      type: "python",
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z"
    },
    {
      id: 3,
      title: "JAVA",
      icon: "fab fa-java",
      description: "Aplicaciones empresariales",
      page: "java",
      type: "java",
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z"
    },
    {
      id: 4,
      title: "PHP",
      icon: "fab fa-php",
      description: "Backend y bases de datos",
      page: "php",
      type: "php",
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z"
    }
  ]
};

export async function ensureDatabase() {
  try {
    await readFile(databasePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await mkdir(path.dirname(databasePath), { recursive: true });
    await writeDatabase(initialDatabase);
  }
}

export async function readDatabase() {
  await ensureDatabase();
  const content = await readFile(databasePath, "utf8");
  const database = JSON.parse(content);

  return {
    users: [],
    userLevels: [],
    pythonLessons: [],
    courseLessons: {},
    courses: [],
    ...database
  };
}

export async function writeDatabase(database) {
  await mkdir(path.dirname(databasePath), { recursive: true });
  await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`);
}
