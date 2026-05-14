import {
  createCourseLesson,
  createCourseLevel,
  deleteCourseLesson,
  deleteCourseLevel,
  findAllCourseLessons,
  findCourseLevel,
  updateCourseLesson,
  updateCourseLevel
} from "../models/courseLessonModel.js";
import { ApiError } from "../utils/ApiError.js";
import { validateCode } from "../utils/judge0Validator.js";
import { broadcastUpdate } from "../utils/realtime.js";

function parseId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ApiError(400, "El id debe ser un numero entero positivo.");
  }

  return parsedId;
}

function updateType(courseType) {
  return `${courseType}-lessons:updated`;
}

export async function getCourseLessons(req, res, next) {
  try {
    const lessons = await findAllCourseLessons(req.params.courseType);
    res.json({ data: lessons });
  } catch (error) {
    next(error);
  }
}

export async function postCourseLesson(req, res, next) {
  try {
    const lesson = await createCourseLesson(req.params.courseType, req.body);
    broadcastUpdate(updateType(req.params.courseType), { lessonId: lesson.id });
    res.status(201).json({
      message: "Leccion creada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function putCourseLesson(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId || req.params.id);
    const lesson = await updateCourseLesson(req.params.courseType, lessonId, req.body);

    if (!lesson) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

    broadcastUpdate(updateType(req.params.courseType), { lessonId });
    res.json({
      message: "Leccion actualizada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCourseLessonHandler(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId || req.params.id);
    const deleted = await deleteCourseLesson(req.params.courseType, lessonId);

    if (!deleted) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

    broadcastUpdate(updateType(req.params.courseType), { lessonId, deleted: true });
    res.json({ message: "Leccion eliminada correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function postCourseLevel(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const level = await createCourseLevel(req.params.courseType, lessonId, req.body);

    if (!level) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

    broadcastUpdate(updateType(req.params.courseType), { lessonId, levelId: level.id });
    res.status(201).json({
      message: "Nivel creado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function putCourseLevel(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const levelId = parseId(req.params.levelId);
    const level = await updateCourseLevel(req.params.courseType, lessonId, levelId, req.body);

    if (!level) {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

    broadcastUpdate(updateType(req.params.courseType), { lessonId, levelId });
    res.json({
      message: "Nivel actualizado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCourseLevelHandler(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const levelId = parseId(req.params.levelId);
    const deleted = await deleteCourseLevel(req.params.courseType, lessonId, levelId);

    if (!deleted) {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

    broadcastUpdate(updateType(req.params.courseType), { lessonId, levelId, deleted: true });
    res.json({ message: "Nivel eliminado correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function validateCourseCode(req, res, next) {
  try {
    const { courseType, lessonId, levelId } = req.params;
    const { source_code } = req.body;

    if (!source_code) {
      throw new ApiError(400, "Falta el parametro: source_code");
    }

    const level = await findCourseLevel(courseType, lessonId, levelId);

    if (!level) {
      throw new ApiError(404, "Nivel no encontrado.");
    }

    if (!level.requiresValidation) {
      throw new ApiError(400, "Este nivel no requiere validacion de codigo.");
    }

    const result = await validateCode(source_code, level.languageId, level.expectedOutput);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
