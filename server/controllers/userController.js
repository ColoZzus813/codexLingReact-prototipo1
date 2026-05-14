import { completeCourseLevel, completePythonLevel, createUser, loginUser } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";

function parseId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ApiError(400, "El id debe ser un numero entero positivo.");
  }

  return parsedId;
}

export async function registerUser(req, res, next) {
  try {
    const result = await createUser(req.body);

    if (result.error === "EMAIL_EXISTS") {
      throw new ApiError(409, "Ya existe un usuario registrado con ese correo.");
    }

    res.status(201).json({
      message: "Usuario registrado correctamente.",
      data: result.user
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = await loginUser(req.body);

    if (!user) {
      throw new ApiError(401, "Correo o contrasena incorrectos.");
    }

    res.json({
      message: "Inicio de sesion exitoso.",
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function completeUserPythonLevel(req, res, next) {
  try {
    const lessonId = parseId(req.body.lessonId);
    const levelId = parseId(req.body.levelId);
    const result = await completePythonLevel(parseId(req.params.id), lessonId, levelId);

    if (!result) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    if (result.error === "LEVEL_NOT_FOUND") {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

    res.json({
      message: result.alreadyCompleted
        ? "Este nivel ya estaba completado."
        : `Nivel completado. Ganaste ${result.xpEarned} XP.`,
      data: result.user,
      meta: {
        alreadyCompleted: result.alreadyCompleted,
        xpEarned: result.xpEarned
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function completeUserCourseLevel(req, res, next) {
  try {
    const lessonId = parseId(req.body.lessonId);
    const levelId = parseId(req.body.levelId);
    const result = await completeCourseLevel(
      parseId(req.params.id),
      req.params.courseType,
      lessonId,
      levelId
    );

    if (!result) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    if (result.error === "LEVEL_NOT_FOUND") {
      throw new ApiError(404, "Leccion o nivel no encontrado.");
    }

    res.json({
      message: result.alreadyCompleted
        ? "Este nivel ya estaba completado."
        : `Nivel completado. Ganaste ${result.xpEarned} XP.`,
      data: result.user,
      meta: {
        alreadyCompleted: result.alreadyCompleted,
        xpEarned: result.xpEarned
      }
    });
  } catch (error) {
    next(error);
  }
}
