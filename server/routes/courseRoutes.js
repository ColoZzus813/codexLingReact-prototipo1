import { Router } from "express";
import {
  getCourseById,
  getCourses,
  postCourse,
  putCourse,
  removeCourse
} from "../controllers/courseController.js";
import { validateCourse, validatePartialCourse } from "../middlewares/validateCourse.js";

const router = Router();

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", validateCourse, postCourse);
router.put("/:id", validatePartialCourse, putCourse);
router.delete("/:id", removeCourse);

export default router;
