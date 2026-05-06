import {
  createCourse,
  deleteCourse,
  findAllCourses,
  findCourseById,
  updateCourse
} from "../models/courseModel.js";
import { ApiError } from "../utils/ApiError.js";

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
    res.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
}

export async function putCourse(req, res, next) {
  try {
    const course = await updateCourse(parseId(req.params.id), req.body);

    if (!course) {
      throw new ApiError(404, "Curso no encontrado.");
    }

    res.json({ data: course });
  } catch (error) {
    next(error);
  }
}

export async function removeCourse(req, res, next) {
  try {
    const wasDeleted = await deleteCourse(parseId(req.params.id));

    if (!wasDeleted) {
      throw new ApiError(404, "Curso no encontrado.");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
