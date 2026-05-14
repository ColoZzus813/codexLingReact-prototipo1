import { Router } from "express";
import {
  getPythonLessons,
  postPythonLesson,
  putPythonLesson,
  deletePythonLessonHandler,
  postPythonLevel,
  putPythonLevel,
  deletePythonLevelHandler,
  validatePythonCode
} from "../controllers/pythonLessonController.js";

const router = Router();

router.get("/", getPythonLessons);
router.post("/", postPythonLesson);
router.put("/:id", putPythonLesson);
router.delete("/:id", deletePythonLessonHandler);
router.post("/:lessonId/levels", postPythonLevel);
router.put("/:lessonId/levels/:levelId", putPythonLevel);
router.delete("/:lessonId/levels/:levelId", deletePythonLevelHandler);
router.post("/:lessonId/levels/:levelId/validate", validatePythonCode);

export default router;
