import { readDatabase, writeDatabase } from "../config/database.js";

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function normalizeCourseType(courseType) {
  return String(courseType || "").trim().toLowerCase();
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

function getCourseLessons(database, courseType) {
  const normalizedType = normalizeCourseType(courseType);

  if (database.courseLessons?.[normalizedType]) {
    return database.courseLessons[normalizedType];
  }

  if (normalizedType === "python") {
    return database.pythonLessons || [];
  }

  return [];
}

function setCourseLessons(database, courseType, lessons) {
  const normalizedType = normalizeCourseType(courseType);
  database.courseLessons ||= {};
  database.courseLessons[normalizedType] = lessons;

  if (normalizedType === "python") {
    database.pythonLessons = lessons;
  }
}

export async function findAllCourseLessons(courseType) {
  const database = await readDatabase();
  return sortByOrder(getCourseLessons(database, courseType)).map(normalizeLesson);
}

export async function createCourseLesson(courseType, lessonData) {
  const database = await readDatabase();
  const lessons = getCourseLessons(database, courseType);
  const now = new Date().toISOString();
  const lesson = {
    id: nextId(lessons),
    title: lessonData.title,
    description: lessonData.description || "",
    xpReward: Number(lessonData.xpReward) || 0,
    order: Number(lessonData.order) || lessons.length + 1,
    levels: [],
    createdAt: now,
    updatedAt: now
  };

  const updatedLessons = [...lessons, lesson];
  setCourseLessons(database, courseType, updatedLessons);
  await writeDatabase(database);
  return lesson;
}

export async function updateCourseLesson(courseType, id, lessonData) {
  const database = await readDatabase();
  const lessons = getCourseLessons(database, courseType);
  const index = lessons.findIndex((lesson) => lesson.id === id);

  if (index === -1) {
    return null;
  }

  lessons[index] = {
    ...lessons[index],
    ...lessonData,
    id,
    xpReward:
      lessonData.xpReward !== undefined
        ? Number(lessonData.xpReward)
        : lessons[index].xpReward,
    order: lessonData.order !== undefined ? Number(lessonData.order) : lessons[index].order,
    updatedAt: new Date().toISOString()
  };

  setCourseLessons(database, courseType, lessons);
  await writeDatabase(database);
  return normalizeLesson(lessons[index]);
}

export async function deleteCourseLesson(courseType, id) {
  const database = await readDatabase();
  const lessons = getCourseLessons(database, courseType);
  const index = lessons.findIndex((lesson) => lesson.id === id);

  if (index === -1) {
    return false;
  }

  lessons.splice(index, 1);
  setCourseLessons(database, courseType, lessons);
  await writeDatabase(database);
  return true;
}

export async function createCourseLevel(courseType, lessonId, levelData) {
  const database = await readDatabase();
  const lessons = getCourseLessons(database, courseType);
  const lesson = lessons.find((currentLesson) => currentLesson.id === lessonId);

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
    order: Number(levelData.order) || lesson.levels.length + 1,
    requiresValidation: levelData.requiresValidation || false,
    expectedOutput: levelData.expectedOutput || "",
    languageId: Number(levelData.languageId) || 71
  };

  lesson.levels.push(level);
  lesson.updatedAt = new Date().toISOString();
  setCourseLessons(database, courseType, lessons);
  await writeDatabase(database);
  return level;
}

export async function updateCourseLevel(courseType, lessonId, levelId, levelData) {
  const database = await readDatabase();
  const lessons = getCourseLessons(database, courseType);
  const lesson = lessons.find((currentLesson) => currentLesson.id === lessonId);

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
    order: levelData.order !== undefined ? Number(levelData.order) : lesson.levels[index].order,
    requiresValidation:
      levelData.requiresValidation !== undefined
        ? levelData.requiresValidation
        : lesson.levels[index].requiresValidation,
    expectedOutput:
      levelData.expectedOutput !== undefined
        ? levelData.expectedOutput
        : lesson.levels[index].expectedOutput,
    languageId:
      levelData.languageId !== undefined
        ? Number(levelData.languageId)
        : lesson.levels[index].languageId
  };
  lesson.updatedAt = new Date().toISOString();

  setCourseLessons(database, courseType, lessons);
  await writeDatabase(database);
  return lesson.levels[index];
}

export async function deleteCourseLevel(courseType, lessonId, levelId) {
  const database = await readDatabase();
  const lessons = getCourseLessons(database, courseType);
  const lesson = lessons.find((currentLesson) => currentLesson.id === lessonId);

  if (!lesson) {
    return false;
  }

  const index = lesson.levels.findIndex((level) => level.id === levelId);

  if (index === -1) {
    return false;
  }

  lesson.levels.splice(index, 1);
  lesson.updatedAt = new Date().toISOString();
  setCourseLessons(database, courseType, lessons);
  await writeDatabase(database);
  return true;
}

export async function findCourseLevel(courseType, lessonId, levelId) {
  const parsedLessonId = Number(lessonId);
  const parsedLevelId = Number(levelId);
  const database = await readDatabase();
  const lessons = getCourseLessons(database, courseType);
  const lesson = lessons.find((currentLesson) => currentLesson.id === parsedLessonId);

  if (!lesson) {
    return null;
  }

  return lesson.levels.find((level) => level.id === parsedLevelId) || null;
}
