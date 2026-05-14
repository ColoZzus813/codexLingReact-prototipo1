import {
  createPythonLesson,
  findAllPythonLessons,
  updatePythonLesson,
  deletePythonLesson,
  createPythonLevel,
  updatePythonLevel,
  deletePythonLevel,
  findPythonLevel
} from "../models/pythonLessonModel.js";
import { validateCode } from "../utils/judge0Validator.js";
import { broadcastUpdate } from "../utils/realtime.js";

export async function getPythonLessons(_req, res, next) {
  try {
    const lessons = await findAllPythonLessons();
    res.json({ data: lessons });
  } catch (error) {
    next(error);
  }
}

export async function postPythonLesson(req, res, next) {
  try {
    const lesson = await createPythonLesson(req.body);
    broadcastUpdate("python-lessons:updated", { lessonId: lesson.id });
    res.status(201).json({
      message: "Leccion creada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function putPythonLesson(req, res, next) {
  try {
    const lessonId = Number(req.params.id);
    const lesson = await updatePythonLesson(lessonId, req.body);
    if (!lesson) {
      return res.status(404).json({ error: { message: "Leccion no encontrada." } });
    }
    broadcastUpdate("python-lessons:updated", { lessonId });
    res.json({
      message: "Leccion actualizada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePythonLessonHandler(req, res, next) {
  try {
    const lessonId = Number(req.params.id);
    const deleted = await deletePythonLesson(lessonId);
    if (!deleted) {
      return res.status(404).json({ error: { message: "Leccion no encontrada." } });
    }
    broadcastUpdate("python-lessons:updated", { lessonId, deleted: true });
    res.json({ message: "Leccion eliminada correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function postPythonLevel(req, res, next) {
  try {
    const lessonId = Number(req.params.lessonId);
    const level = await createPythonLevel(lessonId, req.body);
    if (!level) {
      return res.status(404).json({ error: { message: "Leccion no encontrada." } });
    }
    broadcastUpdate("python-lessons:updated", { lessonId, levelId: level.id });
    res.status(201).json({
      message: "Nivel creado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function putPythonLevel(req, res, next) {
  try {
    const lessonId = Number(req.params.lessonId);
    const levelId = Number(req.params.levelId);
    const level = await updatePythonLevel(lessonId, levelId, req.body);
    if (!level) {
      return res.status(404).json({ error: { message: "Nivel no encontrado." } });
    }
    broadcastUpdate("python-lessons:updated", { lessonId, levelId });
    res.json({
      message: "Nivel actualizado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePythonLevelHandler(req, res, next) {
  try {
    const lessonId = Number(req.params.lessonId);
    const levelId = Number(req.params.levelId);
    const deleted = await deletePythonLevel(lessonId, levelId);
    if (!deleted) {
      return res.status(404).json({ error: { message: "Nivel no encontrado." } });
    }
    broadcastUpdate("python-lessons:updated", { lessonId, levelId, deleted: true });
    res.json({ message: "Nivel eliminado correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function validatePythonCode(req, res, next) {
  try {
    const { lessonId, levelId } = req.params;
    const { source_code } = req.body;

    if (!source_code) {
      return res.status(400).json({
        error: { message: "Falta el parámetro: source_code" }
      });
    }

    const level = await findPythonLevel(lessonId, levelId);
    if (!level) {
      return res.status(404).json({
        error: { message: "Nivel no encontrado" }
      });
    }

    if (!level.requiresValidation) {
      return res.status(400).json({
        error: { message: "Este nivel no requiere validación de código" }
      });
    }

    const result = await validateCode(source_code, level.languageId, level.expectedOutput);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
