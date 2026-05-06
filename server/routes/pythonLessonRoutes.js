import { Router } from "express";
import { getPythonLessons } from "../controllers/pythonLessonController.js";

const router = Router();

router.get("/", getPythonLessons);

export default router;
