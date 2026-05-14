import { Router } from "express";
import {
  deleteCourseLessonHandler,
  deleteCourseLevelHandler,
  getCourseLessons,
  postCourseLesson,
  postCourseLevel,
  putCourseLesson,
  putCourseLevel,
  validateCourseCode
} from "../controllers/courseLessonController.js";
import {
  validateLesson,
  validateLevel,
  validatePartialLesson,
  validatePartialLevel
} from "../middlewares/validatePythonLesson.js";

const router = Router({ mergeParams: true });

router.get("/", getCourseLessons);
router.post("/", validateLesson, postCourseLesson);
router.put("/:lessonId", validatePartialLesson, putCourseLesson);
router.delete("/:lessonId", deleteCourseLessonHandler);
router.post("/:lessonId/levels", validateLevel, postCourseLevel);
router.put("/:lessonId/levels/:levelId", validatePartialLevel, putCourseLevel);
router.delete("/:lessonId/levels/:levelId", deleteCourseLevelHandler);
router.post("/:lessonId/levels/:levelId/validate", validateCourseCode);

export default router;
