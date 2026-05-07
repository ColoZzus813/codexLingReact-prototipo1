import { readDatabase, writeDatabase } from "../config/database.js";

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function sortByOrder(items) {
  return [...items].sort((first, second) => first.order - second.order || first.id - second.id);
}

function normalizeLesson(lesson) {
  return {
    ...lesson,
    levels: sortByOrder(lesson.levels || [])
  };
}

export async function findAllPythonLessons() {
  const database = await readDatabase();
  return sortByOrder(database.pythonLessons).map(normalizeLesson);
}

export async function createPythonLesson(lessonData) {
  const database = await readDatabase();
  const now = new Date().toISOString();
  const lesson = {
    id: nextId(database.pythonLessons),
    title: lessonData.title,
    description: lessonData.description || "",
    xpReward: Number(lessonData.xpReward) || 0,
    order: Number(lessonData.order) || database.pythonLessons.length + 1,
    levels: [],
    createdAt: now,
    updatedAt: now
  };

  database.pythonLessons.push(lesson);
  await writeDatabase(database);
  return lesson;
}

export async function updatePythonLesson(id, lessonData) {
  const database = await readDatabase();
  const index = database.pythonLessons.findIndex((lesson) => lesson.id === id);

  if (index === -1) {
    return null;
  }

  database.pythonLessons[index] = {
    ...database.pythonLessons[index],
    ...lessonData,
    id,
    xpReward:
      lessonData.xpReward !== undefined
        ? Number(lessonData.xpReward)
        : database.pythonLessons[index].xpReward,
    order: lessonData.order !== undefined ? Number(lessonData.order) : database.pythonLessons[index].order,
    updatedAt: new Date().toISOString()
  };

  await writeDatabase(database);
  return normalizeLesson(database.pythonLessons[index]);
}

export async function deletePythonLesson(id) {
  const database = await readDatabase();
  const index = database.pythonLessons.findIndex((lesson) => lesson.id === id);

  if (index === -1) {
    return false;
  }

  database.pythonLessons.splice(index, 1);
  await writeDatabase(database);
  return true;
}

export async function createPythonLevel(lessonId, levelData) {
  const database = await readDatabase();
  const lesson = database.pythonLessons.find((currentLesson) => currentLesson.id === lessonId);

  if (!lesson) {
    return null;
  }

  lesson.levels ||= [];
  const level = {
    id: nextId(lesson.levels),
    title: levelData.title,
    description: levelData.description || "",
    content: levelData.content || "",
    xpReward: Number(levelData.xpReward) || Number(lesson.xpReward) || 10,
    order: Number(levelData.order) || lesson.levels.length + 1
  };

  lesson.levels.push(level);
  lesson.updatedAt = new Date().toISOString();
  await writeDatabase(database);
  return level;
}

export async function updatePythonLevel(lessonId, levelId, levelData) {
  const database = await readDatabase();
  const lesson = database.pythonLessons.find((currentLesson) => currentLesson.id === lessonId);

  if (!lesson) {
    return null;
  }

  const index = lesson.levels.findIndex((level) => level.id === levelId);

  if (index === -1) {
    return null;
  }

  lesson.levels[index] = {
    ...lesson.levels[index],
    ...levelData,
    id: levelId,
    xpReward:
      levelData.xpReward !== undefined
        ? Number(levelData.xpReward)
        : lesson.levels[index].xpReward,
    order: levelData.order !== undefined ? Number(levelData.order) : lesson.levels[index].order
  };
  lesson.updatedAt = new Date().toISOString();

  await writeDatabase(database);
  return lesson.levels[index];
}

export async function deletePythonLevel(lessonId, levelId) {
  const database = await readDatabase();
  const lesson = database.pythonLessons.find((currentLesson) => currentLesson.id === lessonId);

  if (!lesson) {
    return false;
  }

  const index = lesson.levels.findIndex((level) => level.id === levelId);

  if (index === -1) {
    return false;
  }

  lesson.levels.splice(index, 1);
  lesson.updatedAt = new Date().toISOString();
  await writeDatabase(database);
  return true;
}
