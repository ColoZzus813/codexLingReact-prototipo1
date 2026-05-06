import { createUser, loginUser } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";

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
