import { ApiError } from "../utils/ApiError.js";

const allowedFields = ["title", "icon", "description", "page", "type"];
const requiredFields = ["title", "description", "page", "type"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeCourse(body) {
  return allowedFields.reduce((normalized, field) => {
    if (body[field] !== undefined) {
      normalized[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }

    return normalized;
  }, {});
}

function validateFields(course, fields) {
  const errors = [];

  fields.forEach((field) => {
    if (!isNonEmptyString(course[field])) {
      errors.push(`${field} es obligatorio y debe ser texto.`);
    }
  });

  if (course.icon !== undefined && !isNonEmptyString(course.icon)) {
    errors.push("icon debe ser texto si se envia.");
  }

  return errors;
}

export function validateCourse(req, _res, next) {
  const course = normalizeCourse(req.body);
  const errors = validateFields(course, requiredFields);

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para crear el curso.", errors));
    return;
  }

  req.body = {
    icon: "",
    ...course
  };

  next();
}

export function validatePartialCourse(req, _res, next) {
  const course = normalizeCourse(req.body);
  const fieldsToValidate = Object.keys(course).filter((field) => requiredFields.includes(field));
  const errors = validateFields(course, fieldsToValidate);

  if (Object.keys(course).length === 0) {
    errors.push("Debes enviar al menos un campo valido para actualizar.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para actualizar el curso.", errors));
    return;
  }

  req.body = course;
  next();
}
