import {
  createCourse,
  deleteCourse,
  findAllCourses,
  findCourseById,
  updateCourse
} from "../models/courseModel.js";
import { ApiError } from "../utils/ApiError.js";
import { broadcastUpdate } from "../utils/realtime.js";

function parseId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ApiError(400, "El id debe ser un numero entero positivo.");
  }

  return parsedId;
}

export async function getCourses(_req, res, next) {
  try {
    const courses = await findAllCourses();
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
}

export async function getCourseById(req, res, next) {
  try {
    const course = await findCourseById(parseId(req.params.id));

    if (!course) {
      throw new ApiError(404, "Curso no encontrado.");
    }

    res.json({ data: course });
  } catch (error) {
    next(error);
  }
}

export async function postCourse(req, res, next) {
  try {
    const course = await createCourse(req.body);
    broadcastUpdate("courses:updated", { courseId: course.id });
    res.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
}

export async function putCourse(req, res, next) {
  try {
    const courseId = parseId(req.params.id);
    const course = await updateCourse(courseId, req.body);

    if (!course) {
      throw new ApiError(404, "Curso no encontrado.");
    }

    broadcastUpdate("courses:updated", { courseId });

    res.json({ data: course });
  } catch (error) {
    next(error);
  }
}

export async function removeCourse(req, res, next) {
  try {
    const courseId = parseId(req.params.id);
    const wasDeleted = await deleteCourse(courseId);

    if (!wasDeleted) {
      throw new ApiError(404, "Curso no encontrado.");
    }

    broadcastUpdate("courses:updated", { courseId, deleted: true });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
