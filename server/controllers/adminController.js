import { env } from "../config/env.js";
import { readDatabase } from "../config/database.js";
import { deleteCourse, updateCourse } from "../models/courseModel.js";
import {
  createCourseLesson,
  createCourseLevel,
  deleteCourseLesson,
  deleteCourseLevel,
  updateCourseLesson,
  updateCourseLevel
} from "../models/courseLessonModel.js";
import {
  createPythonLesson,
  createPythonLevel,
  deletePythonLesson,
  deletePythonLevel,
  updatePythonLesson,
  updatePythonLevel
} from "../models/pythonLessonModel.js";
import {
  createUserLevel,
  deleteUserLevel,
  updateUserLevel
} from "../models/userLevelModel.js";
import { deleteUser, findAllPublicUsers, updateUser } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { broadcastUpdate } from "../utils/realtime.js";

function parseId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ApiError(400, "El id debe ser un numero entero positivo.");
  }

  return parsedId;
}

function courseLessonUpdateType(courseType) {
  return `${courseType}-lessons:updated`;
}

export function adminLogin(req, res, next) {
  try {
    if (req.body.adminKey !== env.adminKey) {
      throw new ApiError(401, "Clave de administrador invalida.");
    }

    res.json({
      message: "Acceso de administrador concedido.",
      data: { role: "admin" }
    });
  } catch (error) {
    next(error);
  }
}

export async function getDatabase(req, res, next) {
  try {
    const database = await readDatabase();
    const users = await findAllPublicUsers();

    res.json({
      data: {
        ...database,
        users
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCourse(req, res, next) {
  try {
    const courseId = parseId(req.params.id);
    const course = await updateCourse(courseId, req.body);

    if (!course) {
      throw new ApiError(404, "Curso no encontrado.");
    }

    broadcastUpdate("courses:updated", { courseId });

    res.json({
      message: "Curso actualizado correctamente.",
      data: course
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCourse(req, res, next) {
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

export async function updateAdminUser(req, res, next) {
  try {
    const userId = parseId(req.params.id);
    const result = await updateUser(userId, req.body);

    if (!result) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    if (result.error === "EMAIL_EXISTS") {
      throw new ApiError(409, "Ya existe un usuario registrado con ese correo.");
    }

    broadcastUpdate("users:updated", { userId });

    res.json({
      message: "Usuario actualizado correctamente.",
      data: result.user
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminUser(req, res, next) {
  try {
    const userId = parseId(req.params.id);
    const wasDeleted = await deleteUser(userId);

    if (!wasDeleted) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    broadcastUpdate("users:updated", { userId, deleted: true });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function createAdminUserLevel(req, res, next) {
  try {
    const level = await createUserLevel(req.body);
    broadcastUpdate("user-levels:updated", { levelId: level.id });
    res.status(201).json({
      message: "Nivel de experiencia creado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminUserLevel(req, res, next) {
  try {
    const levelId = parseId(req.params.levelId);
    const level = await updateUserLevel(levelId, req.body);

    if (!level) {
      throw new ApiError(404, "Nivel de experiencia no encontrado.");
    }

    broadcastUpdate("user-levels:updated", { levelId });

    res.json({
      message: "Nivel de experiencia actualizado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminUserLevel(req, res, next) {
  try {
    const levelId = parseId(req.params.levelId);
    const wasDeleted = await deleteUserLevel(levelId);

    if (!wasDeleted) {
      throw new ApiError(404, "Nivel de experiencia no encontrado.");
    }

    broadcastUpdate("user-levels:updated", { levelId, deleted: true });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function createAdminPythonLesson(req, res, next) {
  try {
    const lesson = await createPythonLesson(req.body);
    broadcastUpdate("python-lessons:updated", { lessonId: lesson.id });
    res.status(201).json({
      message: "Leccion de Python creada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminCourseLesson(req, res, next) {
  try {
    const lesson = await createCourseLesson(req.params.courseType, req.body);
    broadcastUpdate(courseLessonUpdateType(req.params.courseType), { lessonId: lesson.id });
    res.status(201).json({
      message: "Leccion creada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCourseLesson(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const lesson = await updateCourseLesson(req.params.courseType, lessonId, req.body);

    if (!lesson) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

    broadcastUpdate(courseLessonUpdateType(req.params.courseType), { lessonId });
    res.json({
      message: "Leccion actualizada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCourseLesson(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const wasDeleted = await deleteCourseLesson(req.params.courseType, lessonId);

    if (!wasDeleted) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

    broadcastUpdate(courseLessonUpdateType(req.params.courseType), { lessonId, deleted: true });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function createAdminCourseLevel(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const level = await createCourseLevel(req.params.courseType, lessonId, req.body);

    if (!level) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

    broadcastUpdate(courseLessonUpdateType(req.params.courseType), { lessonId, levelId: level.id });
    res.status(201).json({
      message: "Nivel creado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCourseLevel(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const levelId = parseId(req.params.levelId);
    const level = await updateCourseLevel(req.params.courseType, lessonId, levelId, req.body);

    if (!level) {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

    broadcastUpdate(courseLessonUpdateType(req.params.courseType), { lessonId, levelId });
    res.json({
      message: "Nivel actualizado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCourseLevel(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const levelId = parseId(req.params.levelId);
    const wasDeleted = await deleteCourseLevel(req.params.courseType, lessonId, levelId);

    if (!wasDeleted) {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

    broadcastUpdate(courseLessonUpdateType(req.params.courseType), { lessonId, levelId, deleted: true });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateAdminPythonLesson(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const lesson = await updatePythonLesson(lessonId, req.body);

    if (!lesson) {
      throw new ApiError(404, "Leccion no encontrada.");
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

export async function deleteAdminPythonLesson(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const wasDeleted = await deletePythonLesson(lessonId);

    if (!wasDeleted) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

    broadcastUpdate("python-lessons:updated", { lessonId, deleted: true });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function createAdminPythonLevel(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const level = await createPythonLevel(lessonId, req.body);

    if (!level) {
      throw new ApiError(404, "Leccion no encontrada.");
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

export async function updateAdminPythonLevel(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const levelId = parseId(req.params.levelId);
    const level = await updatePythonLevel(
      lessonId,
      levelId,
      req.body
    );

    if (!level) {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
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

export async function deleteAdminPythonLevel(req, res, next) {
  try {
    const lessonId = parseId(req.params.lessonId);
    const levelId = parseId(req.params.levelId);
    const wasDeleted = await deletePythonLevel(lessonId, levelId);

    if (!wasDeleted) {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

    broadcastUpdate("python-lessons:updated", { lessonId, levelId, deleted: true });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
