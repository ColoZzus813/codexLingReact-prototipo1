import { Router } from "express";
import {
  adminLogin,
  createAdminCourseLesson,
  createAdminCourseLevel,
  createAdminPythonLesson,
  createAdminPythonLevel,
  createAdminUserLevel,
  deleteAdminCourse,
  deleteAdminCourseLesson,
  deleteAdminCourseLevel,
  deleteAdminPythonLesson,
  deleteAdminPythonLevel,
  deleteAdminUser,
  deleteAdminUserLevel,
  getDatabase,
  updateAdminCourse,
  updateAdminCourseLesson,
  updateAdminCourseLevel,
  updateAdminPythonLesson,
  updateAdminPythonLevel,
  updateAdminUser,
  updateAdminUserLevel,
  updateAdminForumTopic,
  deleteAdminForumTopic,
  deleteAdminForumComment
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
import { validatePartialUserLevel, validateUserLevel } from "../middlewares/validateUserLevel.js";

const router = Router();

router.post("/login", adminLogin);
router.get("/database", requireAdmin, getDatabase);
router.put("/courses/:id", requireAdmin, validatePartialCourse, updateAdminCourse);
router.delete("/courses/:id", requireAdmin, deleteAdminCourse);
router.put("/users/:id", requireAdmin, validatePartialUser, updateAdminUser);
router.delete("/users/:id", requireAdmin, deleteAdminUser);
router.post("/user-levels", requireAdmin, validateUserLevel, createAdminUserLevel);
router.put("/user-levels/:levelId", requireAdmin, validatePartialUserLevel, updateAdminUserLevel);
router.delete("/user-levels/:levelId", requireAdmin, deleteAdminUserLevel);
router.post("/courses/:courseType/lessons", requireAdmin, validateLesson, createAdminCourseLesson);
router.put("/courses/:courseType/lessons/:lessonId", requireAdmin, validatePartialLesson, updateAdminCourseLesson);
router.delete("/courses/:courseType/lessons/:lessonId", requireAdmin, deleteAdminCourseLesson);
router.post("/courses/:courseType/lessons/:lessonId/levels", requireAdmin, validateLevel, createAdminCourseLevel);
router.put(
  "/courses/:courseType/lessons/:lessonId/levels/:levelId",
  requireAdmin,
  validatePartialLevel,
  updateAdminCourseLevel
);
router.delete("/courses/:courseType/lessons/:lessonId/levels/:levelId", requireAdmin, deleteAdminCourseLevel);
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
router.put("/forum/topics/:topicId", requireAdmin, updateAdminForumTopic);
router.delete("/forum/topics/:topicId", requireAdmin, deleteAdminForumTopic);
router.delete("/forum/topics/:topicId/comments/:commentId", requireAdmin, deleteAdminForumComment);

export default router;
