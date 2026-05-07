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
    courses: [],
    ...database
  };
}

export async function writeDatabase(database) {
  await mkdir(path.dirname(databasePath), { recursive: true });
  await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`);
}
