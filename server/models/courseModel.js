import { readDatabase, writeDatabase } from "../config/database.js";

function nextId(courses) {
  return courses.length > 0 ? Math.max(...courses.map((course) => course.id)) + 1 : 1;
}

export async function findAllCourses() {
  const database = await readDatabase();
  return database.courses;
}

export async function findCourseById(id) {
  const courses = await findAllCourses();
  return courses.find((course) => course.id === id) || null;
}

export async function createCourse(courseData) {
  const database = await readDatabase();
  const now = new Date().toISOString();
  const course = {
    id: nextId(database.courses),
    ...courseData,
    createdAt: now,
    updatedAt: now
  };

  database.courses.push(course);
  await writeDatabase(database);
  return course;
}

export async function updateCourse(id, courseData) {
  const database = await readDatabase();
  const index = database.courses.findIndex((course) => course.id === id);

  if (index === -1) {
    return null;
  }

  database.courses[index] = {
    ...database.courses[index],
    ...courseData,
    id,
    updatedAt: new Date().toISOString()
  };

  await writeDatabase(database);
  return database.courses[index];
}

export async function deleteCourse(id) {
  const database = await readDatabase();
  const index = database.courses.findIndex((course) => course.id === id);

  if (index === -1) {
    return false;
  }

  database.courses.splice(index, 1);
  await writeDatabase(database);
  return true;
}
