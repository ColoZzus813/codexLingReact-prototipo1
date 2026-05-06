import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function requireAdmin(req, _res, next) {
  const adminKey = req.header("x-admin-key");

  if (!adminKey || adminKey !== env.adminKey) {
    next(new ApiError(401, "Clave de administrador invalida."));
    return;
  }

  next();
}
