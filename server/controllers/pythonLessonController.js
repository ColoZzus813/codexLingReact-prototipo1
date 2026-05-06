import {
  createPythonLesson,
  findAllPythonLessons
} from "../models/pythonLessonModel.js";

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
    res.status(201).json({
      message: "Leccion creada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}
