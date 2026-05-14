import {
  createCourseLesson,
  createCourseLevel,
  deleteCourseLesson,
  deleteCourseLevel,
  findAllCourseLessons,
  findCourseLevel,
  updateCourseLesson,
  updateCourseLevel
} from "./courseLessonModel.js";

const PYTHON_COURSE_TYPE = "python";

export function findAllPythonLessons() {
  return findAllCourseLessons(PYTHON_COURSE_TYPE);
}

export function createPythonLesson(lessonData) {
  return createCourseLesson(PYTHON_COURSE_TYPE, lessonData);
}

export function updatePythonLesson(id, lessonData) {
  return updateCourseLesson(PYTHON_COURSE_TYPE, id, lessonData);
}

export function deletePythonLesson(id) {
  return deleteCourseLesson(PYTHON_COURSE_TYPE, id);
}

export function createPythonLevel(lessonId, levelData) {
  return createCourseLevel(PYTHON_COURSE_TYPE, lessonId, levelData);
}

export function updatePythonLevel(lessonId, levelId, levelData) {
  return updateCourseLevel(PYTHON_COURSE_TYPE, lessonId, levelId, levelData);
}

export function deletePythonLevel(lessonId, levelId) {
  return deleteCourseLevel(PYTHON_COURSE_TYPE, lessonId, levelId);
}

export function findPythonLevel(lessonId, levelId) {
  return findCourseLevel(PYTHON_COURSE_TYPE, lessonId, levelId);
}
