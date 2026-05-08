import { Router } from "express";
import {
  getPythonLessons,
  postPythonLesson,
  putPythonLesson,
  deletePythonLesson,
  postPythonLevel,
  putPythonLevel,
  deletePythonLevel,
  executeCode
} from "../controllers/pythonLessonController.js";

const router = Router();

router.get("/", getPythonLessons);
router.post("/", postPythonLesson);
router.put("/:id", putPythonLesson);
router.delete("/:id", deletePythonLesson);
router.post("/:lessonId/levels", postPythonLevel);
router.put("/:lessonId/levels/:levelId", putPythonLevel);
router.delete("/:lessonId/levels/:levelId", deletePythonLevel);
router.post("/execute", executeCode);

export default router;
