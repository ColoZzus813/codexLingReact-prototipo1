import { readDatabase, writeDatabase } from "../config/database.js";

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

export function sortUserLevels(levels = []) {
  return [...levels].sort((first, second) => first.minXp - second.minXp || first.id - second.id);
}

export function resolveUserLevel(experience = 0, levels = []) {
  const sortedLevels = sortUserLevels(levels);
  const currentLevel =
    [...sortedLevels].reverse().find((level) => experience >= Number(level.minXp || 0)) ||
    sortedLevels[0] ||
    null;
  const nextLevel = sortedLevels.find((level) => Number(level.minXp || 0) > experience) || null;

  return { currentLevel, nextLevel };
}

export async function createUserLevel(levelData) {
  const database = await readDatabase();
  const now = new Date().toISOString();
  const level = {
    id: nextId(database.userLevels),
    title: levelData.title,
    description: levelData.description || "",
    minXp: Number(levelData.minXp) || 0,
    badge: levelData.badge || "",
    createdAt: now,
    updatedAt: now
  };

  database.userLevels.push(level);
  await writeDatabase(database);
  return level;
}

export async function updateUserLevel(id, levelData) {
  const database = await readDatabase();
  const index = database.userLevels.findIndex((level) => level.id === id);

  if (index === -1) {
    return null;
  }

  database.userLevels[index] = {
    ...database.userLevels[index],
    ...levelData,
    id,
    minXp:
      levelData.minXp !== undefined
        ? Number(levelData.minXp)
        : database.userLevels[index].minXp,
    updatedAt: new Date().toISOString()
  };

  await writeDatabase(database);
  return database.userLevels[index];
}

export async function deleteUserLevel(id) {
  const database = await readDatabase();
  const index = database.userLevels.findIndex((level) => level.id === id);

  if (index === -1) {
    return false;
  }

  database.userLevels.splice(index, 1);
  await writeDatabase(database);
  return true;
}
