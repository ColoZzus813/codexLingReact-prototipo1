import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { readDatabase, writeDatabase } from "../config/database.js";

export function hashPassword(password, salt = randomUUID()) {
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  const [salt, originalHash] = storedPassword.split(":");
  const candidateHash = hashPassword(password, salt).split(":")[1];

  return timingSafeEqual(Buffer.from(candidateHash), Buffer.from(originalHash));
}

function publicUser(user) {
  const safeUser = { ...user };
  delete safeUser.password;
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
    createdAt: now,
    updatedAt: now
  };

  database.users.push(user);
  await writeDatabase(database);

  return { user: publicUser(user) };
}

export async function loginUser(credentials) {
  const database = await readDatabase();
  const email = credentials.email.toLowerCase();
  const user = database.users.find((currentUser) => currentUser.email === email);

  if (!user || !verifyPassword(credentials.password, user.password)) {
    return null;
  }

  return publicUser(user);
}

export async function findAllPublicUsers() {
  const database = await readDatabase();
  return database.users.map(publicUser);
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

  return { user: publicUser(updatedUser) };
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
