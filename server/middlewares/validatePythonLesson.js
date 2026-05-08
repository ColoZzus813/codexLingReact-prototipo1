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
    xpReward: normalizeNumber(body.xpReward),
    order: normalizeNumber(body.order),
    hasCompiler: body.hasCompiler,
    expectedOutput: normalizeText(body.expectedOutput),
    language: normalizeText(body.language),
    compilerInstructions: normalizeText(body.compilerInstructions)
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

  if (payload.xpReward !== undefined && (!Number.isInteger(payload.xpReward) || payload.xpReward < 0)) {
    errors.push("xpReward debe ser un numero entero mayor o igual a 0.");
  }

  if (payload.hasCompiler !== undefined && typeof payload.hasCompiler !== "boolean") {
    errors.push("hasCompiler debe ser un valor booleano.");
  }

  if (payload.expectedOutput !== undefined && typeof payload.expectedOutput !== "string") {
    errors.push("expectedOutput debe ser texto.");
  }

  if (payload.language !== undefined && typeof payload.language !== "string") {
    errors.push("language debe ser texto.");
  }

  if (payload.compilerInstructions !== undefined && typeof payload.compilerInstructions !== "string") {
    errors.push("compilerInstructions debe ser texto.");
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
