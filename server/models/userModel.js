import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { readDatabase, writeDatabase } from "../config/database.js";
import { resolveUserLevel } from "./userLevelModel.js";

export function hashPassword(password, salt = randomUUID()) {
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  const [salt, originalHash] = storedPassword.split(":");
  const candidateHash = hashPassword(password, salt).split(":")[1];

  return timingSafeEqual(Buffer.from(candidateHash), Buffer.from(originalHash));
}

function levelKey(lessonId, levelId) {
  return `${lessonId}:${levelId}`;
}

function normalizeUserProgress(user) {
  return {
    experience: Number(user.experience) || 0,
    completedPythonLevels: Array.isArray(user.completedPythonLevels)
      ? user.completedPythonLevels
      : []
  };
}

function totalPythonLevels(pythonLessons = []) {
  return pythonLessons.reduce((total, lesson) => total + (lesson.levels?.length || 0), 0);
}

function buildProfile(user, database) {
  const progress = normalizeUserProgress(user);
  const { currentLevel, nextLevel } = resolveUserLevel(progress.experience, database.userLevels);
  const currentMinXp = Number(currentLevel?.minXp || 0);
  const nextMinXp = Number(nextLevel?.minXp || currentMinXp);
  const levelRange = Math.max(nextMinXp - currentMinXp, 1);
  const levelProgress = nextLevel
    ? Math.min(100, Math.round(((progress.experience - currentMinXp) / levelRange) * 100))
    : 100;

  return {
    experience: progress.experience,
    completedPythonLevels: progress.completedPythonLevels,
    completedPythonLevelsCount: progress.completedPythonLevels.length,
    totalPythonLevels: totalPythonLevels(database.pythonLessons),
    currentLevel,
    nextLevel,
    xpToNextLevel: nextLevel ? Math.max(nextMinXp - progress.experience, 0) : 0,
    levelProgress
  };
}

function publicUser(user, database = { userLevels: [], pythonLessons: [] }) {
  const safeUser = { ...user };
  delete safeUser.password;
  const progress = normalizeUserProgress(user);

  safeUser.experience = progress.experience;
  safeUser.completedPythonLevels = progress.completedPythonLevels;
  safeUser.profile = buildProfile(safeUser, database);
  return safeUser;
}

function nextId(users) {
  return users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
}

export async function createUser(userData) {
  const database = await readDatabase();
  const email = userData.email.toLowerCase();
  const existingUser = database.users.find((user) => user.email === email);

  if (existingUser) {
    return { error: "EMAIL_EXISTS" };
  }

  const now = new Date().toISOString();
  const user = {
    id: nextId(database.users),
    name: userData.name,
    email,
    password: hashPassword(userData.password),
    experience: 0,
    completedPythonLevels: [],
    createdAt: now,
    updatedAt: now
  };

  database.users.push(user);
  await writeDatabase(database);

  return { user: publicUser(user, database) };
}

export async function loginUser(credentials) {
  const database = await readDatabase();
  const email = credentials.email.toLowerCase();
  const user = database.users.find((currentUser) => currentUser.email === email);

  if (!user || !verifyPassword(credentials.password, user.password)) {
    return null;
  }

  return publicUser(user, database);
}

export async function findAllPublicUsers() {
  const database = await readDatabase();
  return database.users.map((user) => publicUser(user, database));
}

export async function updateUser(id, userData) {
  const database = await readDatabase();
  const index = database.users.findIndex((user) => user.id === id);

  if (index === -1) {
    return null;
  }

  if (userData.email) {
    const email = userData.email.toLowerCase();
    const emailInUse = database.users.some((user) => user.email === email && user.id !== id);

    if (emailInUse) {
      return { error: "EMAIL_EXISTS" };
    }

    userData.email = email;
  }

  const updatedUser = {
    ...database.users[index],
    ...userData,
    id,
    updatedAt: new Date().toISOString()
  };

  if (userData.password) {
    updatedUser.password = hashPassword(userData.password);
  }

  database.users[index] = updatedUser;
  await writeDatabase(database);

  return { user: publicUser(updatedUser, database) };
}

export async function deleteUser(id) {
  const database = await readDatabase();
  const index = database.users.findIndex((user) => user.id === id);

  if (index === -1) {
    return false;
  }

  database.users.splice(index, 1);
  await writeDatabase(database);
  return true;
}

export async function completePythonLevel(userId, lessonId, levelId) {
  const database = await readDatabase();
  const userIndex = database.users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return null;
  }

  const lesson = database.pythonLessons.find((currentLesson) => currentLesson.id === lessonId);
  const level = lesson?.levels?.find((currentLevel) => currentLevel.id === levelId);

  if (!lesson || !level) {
    return { error: "LEVEL_NOT_FOUND" };
  }

  const completedKey = levelKey(lessonId, levelId);
  const user = database.users[userIndex];
  const progress = normalizeUserProgress(user);

  if (progress.completedPythonLevels.includes(completedKey)) {
    return {
      user: publicUser(user, database),
      alreadyCompleted: true,
      xpEarned: 0
    };
  }

  const xpEarned = Number(level.xpReward ?? lesson.xpReward ?? 10) || 0;
  const updatedUser = {
    ...user,
    experience: progress.experience + xpEarned,
    completedPythonLevels: [...progress.completedPythonLevels, completedKey],
    updatedAt: new Date().toISOString()
  };

  database.users[userIndex] = updatedUser;
  await writeDatabase(database);

  return {
    user: publicUser(updatedUser, database),
    alreadyCompleted: false,
    xpEarned
  };
}
