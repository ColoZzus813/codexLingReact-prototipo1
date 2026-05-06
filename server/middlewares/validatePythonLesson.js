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
    content: normalizeText(body.content),
    order: normalizeNumber(body.order)
  };
  const errors = [];

  if (requiredTitle && (typeof payload.title !== "string" || payload.title.length < 2)) {
    errors.push("title debe tener minimo 2 caracteres.");
  }

  if (payload.title !== undefined && payload.title !== "" && typeof payload.title !== "string") {
    errors.push("title debe ser texto.");
  }

  if (payload.order !== undefined && (!Number.isInteger(payload.order) || payload.order <= 0)) {
    errors.push("order debe ser un numero entero positivo.");
  }

  return {
    payload: Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    ),
    errors
  };
}

export function validateLesson(req, _res, next) {
  const { payload, errors } = validatePayload(req.body);

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para crear la leccion.", errors));
    return;
  }

  req.body = payload;
  next();
}

export function validatePartialLesson(req, _res, next) {
  const { payload, errors } = validatePayload(req.body, false);

  if (Object.keys(payload).length === 0) {
    errors.push("Debes enviar al menos un campo valido para actualizar.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para actualizar la leccion.", errors));
    return;
  }

  req.body = payload;
  next();
}

export const validateLevel = validateLesson;
export const validatePartialLevel = validatePartialLesson;
