import { Router } from "express";
import {
  adminLogin,
  createAdminPythonLesson,
  createAdminPythonLevel,
  deleteAdminCourse,
  deleteAdminPythonLesson,
  deleteAdminPythonLevel,
  deleteAdminUser,
  getDatabase,
  updateAdminCourse,
  updateAdminPythonLesson,
  updateAdminPythonLevel,
  updateAdminUser
} from "../controllers/adminController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { validatePartialCourse } from "../middlewares/validateCourse.js";
import {
  validateLesson,
  validateLevel,
  validatePartialLesson,
  validatePartialLevel
} from "../middlewares/validatePythonLesson.js";
import { validatePartialUser } from "../middlewares/validateUser.js";

const router = Router();

router.post("/login", adminLogin);
router.get("/database", requireAdmin, getDatabase);
router.put("/courses/:id", requireAdmin, validatePartialCourse, updateAdminCourse);
router.delete("/courses/:id", requireAdmin, deleteAdminCourse);
router.put("/users/:id", requireAdmin, validatePartialUser, updateAdminUser);
router.delete("/users/:id", requireAdmin, deleteAdminUser);
router.post("/python-lessons", requireAdmin, validateLesson, createAdminPythonLesson);
router.put("/python-lessons/:lessonId", requireAdmin, validatePartialLesson, updateAdminPythonLesson);
router.delete("/python-lessons/:lessonId", requireAdmin, deleteAdminPythonLesson);
router.post("/python-lessons/:lessonId/levels", requireAdmin, validateLevel, createAdminPythonLevel);
router.put(
  "/python-lessons/:lessonId/levels/:levelId",
  requireAdmin,
  validatePartialLevel,
  updateAdminPythonLevel
);
router.delete("/python-lessons/:lessonId/levels/:levelId", requireAdmin, deleteAdminPythonLevel);

export default router;
