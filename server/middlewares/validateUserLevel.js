import { ApiError } from "../utils/ApiError.js";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeNumber(value) {
  if (value === undefined || value === "") {
    return undefined;
  }

  return Number(value);
}

function validatePayload(body, requiredTitle = true) {
  const payload = {
    title: normalizeText(body.title),
    description: normalizeText(body.description),
    minXp: normalizeNumber(body.minXp),
    badge: normalizeText(body.badge)
  };
  const errors = [];

  if (requiredTitle && (typeof payload.title !== "string" || payload.title.length < 2)) {
    errors.push("title debe tener minimo 2 caracteres.");
  }

  if (payload.title !== undefined && payload.title !== "" && typeof payload.title !== "string") {
    errors.push("title debe ser texto.");
  }

  if (payload.minXp !== undefined && (!Number.isInteger(payload.minXp) || payload.minXp < 0)) {
    errors.push("minXp debe ser un numero entero mayor o igual a 0.");
  }

  return {
    payload: Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    ),
    errors
  };
}

export function validateUserLevel(req, _res, next) {
  const { payload, errors } = validatePayload(req.body);

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para crear el nivel de usuario.", errors));
    return;
  }

  req.body = payload;
  next();
}

export function validatePartialUserLevel(req, _res, next) {
  const { payload, errors } = validatePayload(req.body, false);

  if (Object.keys(payload).length === 0) {
    errors.push("Debes enviar al menos un campo valido para actualizar.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para actualizar el nivel de usuario.", errors));
    return;
  }

  req.body = payload;
  next();
}
