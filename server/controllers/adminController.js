import { env } from "../config/env.js";
import { readDatabase } from "../config/database.js";
import { deleteCourse, updateCourse } from "../models/courseModel.js";
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

function parseId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ApiError(400, "El id debe ser un numero entero positivo.");
  }

  return parsedId;
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
    const course = await updateCourse(parseId(req.params.id), req.body);

    if (!course) {
      throw new ApiError(404, "Curso no encontrado.");
    }

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
    const wasDeleted = await deleteCourse(parseId(req.params.id));

    if (!wasDeleted) {
      throw new ApiError(404, "Curso no encontrado.");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateAdminUser(req, res, next) {
  try {
    const result = await updateUser(parseId(req.params.id), req.body);

    if (!result) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    if (result.error === "EMAIL_EXISTS") {
      throw new ApiError(409, "Ya existe un usuario registrado con ese correo.");
    }

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
    const wasDeleted = await deleteUser(parseId(req.params.id));

    if (!wasDeleted) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function createAdminUserLevel(req, res, next) {
  try {
    const level = await createUserLevel(req.body);
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
    const level = await updateUserLevel(parseId(req.params.levelId), req.body);

    if (!level) {
      throw new ApiError(404, "Nivel de experiencia no encontrado.");
    }

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
    const wasDeleted = await deleteUserLevel(parseId(req.params.levelId));

    if (!wasDeleted) {
      throw new ApiError(404, "Nivel de experiencia no encontrado.");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function createAdminPythonLesson(req, res, next) {
  try {
    const lesson = await createPythonLesson(req.body);
    res.status(201).json({
      message: "Leccion de Python creada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminPythonLesson(req, res, next) {
  try {
    const lesson = await updatePythonLesson(parseId(req.params.lessonId), req.body);

    if (!lesson) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

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
    const wasDeleted = await deletePythonLesson(parseId(req.params.lessonId));

    if (!wasDeleted) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function createAdminPythonLevel(req, res, next) {
  try {
    const level = await createPythonLevel(parseId(req.params.lessonId), req.body);

    if (!level) {
      throw new ApiError(404, "Leccion no encontrada.");
    }

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
    const level = await updatePythonLevel(
      parseId(req.params.lessonId),
      parseId(req.params.levelId),
      req.body
    );

    if (!level) {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

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
    const wasDeleted = await deletePythonLevel(parseId(req.params.lessonId), parseId(req.params.levelId));

    if (!wasDeleted) {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
